
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.beforeSave("Activity", function(request, response) {
  var newEntryActivity = request.object;

  var queryActivity = new Parse.Query("Activity");
  queryActivity.equalTo("from_user", newEntryActivity.get("from_user"));
  queryActivity.equalTo("to_user", newEntryActivity.get("to_user"));

  if (newEntryActivity.get("type") == 1) {
    queryActivity.equalTo("target_post", newEntryActivity.get("target_post"));
  }

  queryActivity.first({
    success: function(temp) {
        response.error({errorCode:420,errorMsg:"Activity already exist"});
    },
    error: function(error) {
      response.success();
    }
  });
});
