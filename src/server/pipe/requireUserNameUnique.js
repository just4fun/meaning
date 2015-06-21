var User, mongoose;

mongoose = require("mongoose");

User = mongoose.model("User");

module.exports = function() {
  return function(req, res, next) {
    if (!req.body.UserName) {
      return next(new Error("No user name."));
    }
    return User.find().exec(function(err, users) {
      var user, _i, _j, _len, _len1;
      if (err) {
        return next(new Error("Show user list failed: " + err));
      } else if (users && users.length > 0) {
        if (req.user) {
          for (_i = 0, _len = users.length; _i < _len; _i++) {
            user = users[_i];
            if (user.UserName === req.body.UserName && user._id.toString() !== req.body._id) {
              next(new Error("This name already exists."));
              return;
            }
          }
        } else {
          for (_j = 0, _len1 = users.length; _j < _len1; _j++) {
            user = users[_j];
            if (user.UserName === req.body.UserName) {
              next(new Error("This name already exists."));
              return;
            }
          }
        }
        return next();
      } else {
        return next();
      }
    });
  };
};
