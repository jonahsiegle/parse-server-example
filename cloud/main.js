
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

// Parse.Cloud.afterSave("Activity", function(request, response) {
//   var activity = request.object;
//   //Write count object
//   if (activity.get("cc") == true) {
//
// activity.get("to_user").get("counts")
//
//     // var queryToCount = new Parse.Query("Count");
//     // queryToCount.equalTo("owner", activity.get("to_user"));
//     // queryToCount.first({
//     //   success: function(fetchedCount) {
//     //     if (activity.get("type") == 1) {
//     //       fetchedCount.increment("total_like_count");
//     //       activity
//     //     } else if (activity.get("type") == 2) {
//     //       fetchedCount.increment("follower_count");
//     //     }
//     //     fetchedCount.save();
//     //   }, error: function(error) {
//     //     console.error("Got an error " + error.code + " : " + error.message);
//     //   }
//     // }
//     //
//     // if (activity.get("type") == 2) {
//     //   var queryFromCount = new Parse.Query("Count");
//     //   queryFromCount.equalTo("owner", activity.get("from_user"));
//     //
//     //   queryFromCount.first({
//     //     success: function(fetchedCount) {
//     //       fetchedCount.increment("following_count");
//     //       fetchedCount.save();
//     //     }, error: function(error) {
//     //       console.error("Got an error " + error.code + " : " + error.message);
//     //     }
//     //   }
//     // }
//   }
// }
