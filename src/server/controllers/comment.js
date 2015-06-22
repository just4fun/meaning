var mongoose = require("mongoose");
var Comment = mongoose.model("Comment");
var Post = mongoose.model("Post");
var _ = require("lodash");
var async = require("async");

exports.get = function(req, res) {
  res.jsonp(req.comment);
};

exports.getList = function(req, res) {
  res.jsonp(req.comments);
};

exports.getById = function(req, res, next, commentId) {
  Comment.findOne({
    _id: commentId
  }).exec(function(err, comment) {
    if (err) {
      next(new Error("Find comment(" + commentId + ") failed: " + err));
    } else if (!comment) {
      res.statusCode = 404;
      res.end();
    } else {
      req.comment = comment;
      next();
    }
  });
};

exports.list = function(req, res, next) {
  Comment.find().sort("CreateDate").exec(function(err, comments) {
    if (err) {
      next(new Error("Show comment list failed: " + err));
    } else {
      res.jsonp(comments);
    }
  });
};

exports.getFromGuestBook = function(req, res, next) {
  Comment.find({
    Post: {
      $exists: false
    }
  }).sort("CreateDate").exec(function(err, comments) {
    if (err) {
      next(new Error("Show comment list from guestbook failed: " + err));
    } else {
      res.jsonp(comments);
    }
  });
};

exports.getListByPost = function(req, res, next, postId) {
  Comment.find({
    Post: postId
  }).sort("CreateDate").exec(function(err, comments) {
    if (err) {
      next(new Error("Show comment list by postId(" + postId + ") failed: " + err));
    } else {
      req.comments = comments;
      next();
    }
  });
};

exports.create = function(req, res, next) {
  var comment = new Comment(req.body);
  var saveGuestbookComment = function() {
    comment.save(function(err) {
      if (err) {
        next(new Error("Create comment(" + comment.Content + ") failed: " + err));
      } else {
        res.jsonp(comment);
      }
    });
  };
  var savePostComment = function() {
    var postId = comment.Post;

    async.waterfall([

      // create comment first
      function(callback) {
        comment.save(function(err) {
          if (err) {
            callback("Create comment(" + comment.Content + ") failed: " + err);
          } else {
            callback(null);
          }
        });
      },

      // then get post
      function(callback) {
        Post.findOne({
          _id: postId
        }).exec(function(err, post) {
          if (err) {
            callback("Find post" + postId + " via comment" + comment.Content + " failed: " + err);
          } else if (!post) {
            res.statusCode = 404;
            res.end();
          } else {
            callback(null, post);
          }
        });
      },

      // then get remaining comments
      function(post, callback) {
        Comment.find({
          Post: postId
        }).sort("CreateDate").select("_id").exec(function(err, comments) {
          if (err) {
            callback("Get remaining comments by postId" + postId + " failed: " + err);
          } else {
            callback(null, post, comments);
          }
        });
      },

      // at last, save post with comments
      function(post, comments, callback) {
        post.Comments = comments;
        post.save(function(err) {
          if (err) {
            callback("Update post with comments failed: " + err);
          } else {
            callback(null);
          }
        });
      }
    ], function(err, result) {
      if (err) {
        next(new Error(err));
      } else {
        res.jsonp(comment);
      }
    });
  };

  // check AllowComments if comment is related to a post
  if (comment.Post) {
    Post.findOne({
      _id: comment.Post
    }).exec(function(err, post) {
      if (err) {
        next(new Error("Find post(" + comment.Post + ") via comment(" + comment._id + ") failed: " + err));
      } else if (!post) {
        res.statusCode = 404;
        res.end();
      } else if (post.AllowComments) {
        savePostComment();
      } else {
        next(new Error("This post is not allowed to publish comment."));
      }
    });
  } else {
    saveGuestbookComment();
  }
};

exports.update = function(req, res, next) {
  var comment = req.comment;
  comment = _.extend(comment, req.body);
  comment.save(function(err) {
    if (err) {
      next(new Error("Update comment(" + comment._id + ") failed: " + err));
    } else {
      res.jsonp(comment);
    }
  });
};

exports["delete"] = function(req, res, next) {
  var comment = req.comment;

  if (comment.Post) {
    var postId = comment.Post;
    async.waterfall([

      // delete comment first
      function(callback) {
        Comment.remove({
          _id: comment._id
        }).exec(function(err) {
          if (err) {
            callback("Delete comment(" + comment._id + ") failed: " + err);
          } else {
            callback(null);
          }
        });
      },

      // then get post
      function(callback) {
        Post.findOne({
          _id: postId
        }).exec(function(err, post) {
          if (err) {
            callback("Find post" + postId + " via comment" + comment.Content + " failed: " + err);
          } else if (!post) {
            res.statusCode = 404;
            res.end();
          } else {
            callback(null, post);
          }
        });
      },

      // then get remaining comments
      function(post, callback) {
        Comment.find({
          Post: postId
        }).sort("CreateDate").select("_id").exec(function(err, comments) {
          if (err) {
            callback("Get remaining comments by postId" + postId + " failed: " + err);
          } else {
            callback(null, post, comments);
          }
        });
      },

      // at last, save post with comments
      function(post, comments, callback) {
        post.Comments = comments;
        post.save(function(err) {
          if (err) {
            callback("Update post with comments failed: " + err);
          } else {
            callback(null);
          }
        });
      }
    ], function(err, result) {
      if (err) {
        next(new Error(err));
      } else {
        res.jsonp("Delete comment successfully!");
      }
    });
  } else {
    Comment.remove({
      _id: comment._id
    }).exec(function(err) {
      if (err) {
        next(new Error("Delete comment(" + comment._id + ") failed: " + err));
      } else {
        res.jsonp("Delete comment successfully!");
      }
    });
  }
};
