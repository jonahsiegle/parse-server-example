
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
        user.get("counts").increment("total_like_count");
      }, error: function(error) {

      }
    });

    activity.get("target_post").increment("like_count");
    activity.get("target_post").save();
  } else if (activity.get("type") == 2) {
    activity.get("to_user").get("counts").increment("follower_count");
    activity.get("to_user").get("counts").save();

    activity.get("from_user").get("counts").increment("following_count");
    activity.get("from_user").get("counts").save();
  }
});
