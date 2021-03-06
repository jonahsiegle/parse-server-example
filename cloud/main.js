
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.beforeSave("Activity", function(request, response) {
  var newEntryActivity = request.object;

  var queryActivity = new Parse.Query("Activity");
  queryActivity.equalTo("from_user", newEntryActivity.get("from_user"));
  queryActivity.equalTo("to_user", newEntryActivity.get("to_user"));
  queryActivity.equalTo("type", newEntryActivity.get("type"));


  if (newEntryActivity.get("type") == 1) {
    queryActivity.equalTo("target_post", newEntryActivity.get("target_post"));
  }

  queryActivity.first({
    success: function(temp) {
      if (temp) {
        response.error({errorCode:420,errorMsg:"Activity already exist"});
      } else {
        response.success();
      }
    },
    error: function(error) {
      response.success();
    }
  });
});

Parse.Cloud.afterSave("Activity", function(request, response) {
  var activity = request.object;
  //Write count object
  if (activity.get("type") == 1) {
    activity.get("to_user").fetch({
      success: function(user) {
        user.get("counts").fetch({
          success: function(counts) {
            counts.increment("total_like_count");
            counts.save();
          }, error: function(error) {
            response.error("Got an error.");
          }
        });
      }, error: function(error) {
        response.error("Got an error.");
      }
    });

    activity.get("target_post").increment("like_count");
    activity.get("target_post").save();

  } else if (activity.get("type") == 2) {
    activity.get("to_user").fetch({
      success: function(user) {
        user.get("counts").fetch({
          success: function(counts) {
            counts.increment("follower_count");
            counts.save();
          }, error: function(error) {
            response.error("Got an error.");
          }
        });
      }, error: function(error) {
        response.error("Got an error.");
      }
    });
    //
    activity.get("from_user").fetch({
      success: function(user) {
        user.get("counts").fetch({
          success: function(counts) {
            counts.increment("following_count");
            counts.save();
          }, error: function(error) {
            response.error("Got an error.");
          }
        });
      }, error: function(error) {
        response.error("Got an error.");
      }
    });
  }
});

Parse.Cloud.afterDelete("Activity", function(request) {
  var activity = request.object;
  //Write count object
  if (activity.get("type") == 1) {
    activity.get("to_user").fetch({
      success: function(user) {
        user.get("counts").fetch({
          success: function(counts) {
            if (counts.get("total_like_count") > 0) {
              counts.increment("total_like_count", -1);
              counts.save();
            }
          }, error: function(error) {
            response.error("Got an error.");
          }
        });
      }, error: function(error) {
        response.error("Got an error.");
      }
    });

    if (activity.get("target_post").get("like_count") > 0) {
      activity.get("target_post").increment("like_count", -1);
      activity.get("target_post").save();
    }
  } else if (activity.get("type") == 2) {
    activity.get("to_user").fetch({
      success: function(user) {
        user.get("counts").fetch({
          success: function(counts) {
            if (counts.get("follower_count") > 0) {
              counts.increment("follower_count", -1);
              counts.save();
            }
          }, error: function(error) {
            response.error("Got an error.");
          }
        });
      }, error: function(error) {
        response.error("Got an error.");
      }
    });
    //
    activity.get("from_user").fetch({
      success: function(user) {
        user.get("counts").fetch({
          success: function(counts) {
            if (counts.get("following_count") > 0) {
              counts.increment("following_count", -1);
              counts.save();
            }
          }, error: function(error) {
            response.error("Got an error.");
          }
        });
      }, error: function(error) {
        response.error("Got an error.");
      }
    });
  }
});

Parse.Cloud.afterSave("Post", function(request, response) {
   var post = request.object;

   Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", post.get("owner").objectId);
    query.first({
      success: function(object) {
        object.increment("posts_count");
        object.save();
      }, error: function(error) {
        console.error("Error getting counts " + error.code + ": " + error.message);
      }
    });
});

Parse.Cloud.afterDelete("Post", function(request) {
  var post = request.object;
  var likeCount = post.get("like_count");

   Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", post.get("owner").objectId);
    query.first({
      success: function(object) {
        if (object.get("posts_count") > 0) {
          object.increment("posts_count", -1);
        }
        object.save();
      }, error: function(error) {
        console.error("Error getting counts " + error.code + ": " + error.message);
      }
    });

  post.get("owner").fetch({
    success: function(user) {
      user.get("counts").fetch({
        success: function(counts) {
          if (counts.get("total_like_count") > 0) {
            counts.increment("total_like_count", -likeCount);
            counts.save();
          }
        }, error: function(error) {
          console.error("Error de incrementing total likes  " + error.code + ": " + error.message);
        }
      });
    }, error: function(error) {
      console.error("Error getting counts " + error.code + ": " + error.message);
    }
  });

  //Remove all activity
  query = new Parse.Query("Activity");
  query.equalTo("target_post", post);

  query.find({
    success: function(activities) {
      Parse.Object.destroyAll(activities, {
        success: function() {},
        error: function(error) {
          console.error("Error deleting related activities " + error.code + ": " + error.message);
        }
      });
    },
    error: function(error) {
      console.error("Error finding related actitivities " + error.code + ": " + error.message);
    }
  });
});
