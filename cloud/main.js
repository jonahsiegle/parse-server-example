
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

    // activity.get("to_user").fetch({
    //   success: function(user) {
    //     user.get("counts").fetch({
    //       success: function(counts) {
    //         counts.increment("follower_count");
    //         counts.save();
    //       }, error: function(error) {
    //         response.error("Got an error.");
    //       }
    //     });
    //   }, error: function(error) {
    //     response.error("Got an error.");
    //   }
    // });
    //
    // activity.from("to_user").fetch({
    //   success: function(user) {
    //     user.get("counts").fetch({
    //       success: function(counts) {
    //         counts.increment("following_count");
    //         counts.save();
    //       }, error: function(error) {
    //         response.error("Got an error.");
    //       }
    //     });
    //   }, error: function(error) {
    //     response.error("Got an error.");
    //   }
    // });
  }
});
