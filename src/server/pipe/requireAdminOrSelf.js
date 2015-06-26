var mongoose = require("mongoose");
var User = mongoose.model("User");

module.exports = function() {
  return function(req, res, next) {
    var token = req.headers["meaning-token"];
    if (token == null) {
      next(new Error("User is not logged in."));
    } else {
      User.findOne({
        Token: token
      }, function(err, user) {
        if (err) {
          next(new Error("Find user via token(" + token + ") failed: " + err));
        } else if (!user) {
          next(new Error("Token is incorrect."));
        } else if (req.user._id.toString() !== user._id.toString() && user.Role !== "Admin") {
          next(new Error("You are not allowed to do this."));
        } else {
          next();
        }
      });
    }
  };
};
