var Post, mongoose;

mongoose = require("mongoose");

Post = mongoose.model("Post");

module.exports = function() {
  return function(req, res, next) {
    if (!req.body.Url) {
      return next(new Error("No url."));
    }
    if (req.body.Url.toLowerCase() === "count") {
      return next(new Error("The post url can not be 'count'."));
    }
    return Post.find().exec(function(err, posts) {
      var post, _i, _j, _len, _len1;
      if (err) {
        return next(new Error("Show post list failed: " + err));
      } else if (posts && posts.length > 0) {
        if (req.post) {
          for (_i = 0, _len = posts.length; _i < _len; _i++) {
            post = posts[_i];
            if (post.Url === req.body.Url && post._id.toString() !== req.body._id) {
              next(new Error("This url already exists."));
              return;
            }
          }
        } else {
          for (_j = 0, _len1 = posts.length; _j < _len1; _j++) {
            post = posts[_j];
            if (post.Url === req.body.Url) {
              next(new Error("This url already exists."));
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
