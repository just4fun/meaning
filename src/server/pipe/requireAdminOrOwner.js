var User, mongoose;

mongoose = require("mongoose");

User = mongoose.model("User");

module.exports = function() {
  return function(req, res, next) {
    var token;
    token = req.headers["meaning-token"];
    if (token == null) {
      return next(new Error("User is not logged in."));
    } else {
      return User.findOne({
        Token: token
      }, function(err, user) {
        if (err) {
          return next(new Error("Find user via token(" + token + ") failed: " + err));
        } else if (!user) {
          return next(new Error("Token is incorrect."));
        } else if (req.post.Author._id.toString() !== user._id.toString() && user.Role !== "Admin") {
          return next(new Error("You are not allowed to do this."));
        } else {
          return next();
        }
      });
    }
  };
};
