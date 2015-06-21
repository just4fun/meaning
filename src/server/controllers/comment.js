var Comment, Post, async, mongoose, _;

mongoose = require("mongoose");

Comment = mongoose.model("Comment");

Post = mongoose.model("Post");

_ = require("lodash");

async = require("async");

exports.get = function(req, res) {
  return res.jsonp(req.comment);
};

exports.getList = function(req, res) {
  return res.jsonp(req.comments);
};

exports.getById = function(req, res, next, commentId) {
  return Comment.findOne({
    _id: commentId
  }).exec(function(err, comment) {
    if (err) {
      return next(new Error("Find comment(" + commentId + ") failed: " + err));
    } else if (!comment) {
      res.statusCode = 404;
      return res.end();
    } else {
      req.comment = comment;
      return next();
    }
  });
};

exports.list = function(req, res, next) {
  return Comment.find().sort("CreateDate").exec(function(err, comments) {
    if (err) {
      return next(new Error("Show comment list failed: " + err));
    } else {
      return res.jsonp(comments);
    }
  });
};

exports.getFromGuestBook = function(req, res, next) {
  return Comment.find({
    Post: {
      $exists: false
    }
  }).sort("CreateDate").exec(function(err, comments) {
    if (err) {
      return next(new Error("Show comment list from guestbook failed: " + err));
    } else {
      return res.jsonp(comments);
    }
  });
};

exports.getListByPost = function(req, res, next, postId) {
  return Comment.find({
    Post: postId
  }).sort("CreateDate").exec(function(err, comments) {
    if (err) {
      return next(new Error("Show comment list by postId(" + postId + ") failed: " + err));
    } else {
      req.comments = comments;
      return next();
    }
  });
};

exports.create = function(req, res, next) {
  var comment, saveGuestbookComment, savePostComment;
  comment = new Comment(req.body);
  saveGuestbookComment = function() {
    return comment.save(function(err) {
      if (err) {
        return next(new Error("Create comment(" + comment.Content + ") failed: " + err));
      } else {
        return res.jsonp(comment);
      }
    });
  };
  savePostComment = function() {
    var postId;
    postId = comment.Post;
    return async.waterfall([
      function(callback) {
        return comment.save(function(err) {
          if (err) {
            return callback("Create comment(" + comment.Content + ") failed: " + err);
          } else {
            return callback(null);
          }
        });
      }, function(callback) {
        return Post.findOne({
          _id: postId
        }).exec(function(err, post) {
          if (err) {
            return callback("Find post" + postId + " via comment" + comment.Content + " failed: " + err);
          } else if (!post) {
            res.statusCode = 404;
            return res.end();
          } else {
            return callback(null, post);
          }
        });
      }, function(post, callback) {
        return Comment.find({
          Post: postId
        }).sort("CreateDate").select("_id").exec(function(err, comments) {
          if (err) {
            return callback("Get remaining comments by postId" + postId + " failed: " + err);
          } else {
            return callback(null, post, comments);
          }
        });
      }, function(post, comments, callback) {
        post.Comments = comments;
        return post.save(function(err) {
          if (err) {
            return callback("Update post with comments failed: " + err);
          } else {
            return callback(null);
          }
        });
      }
    ], function(err, result) {
      if (err) {
        return next(new Error(err));
      } else {
        return res.jsonp(comment);
      }
    });
  };
  if (comment.Post) {
    return Post.findOne({
      _id: comment.Post
    }).exec(function(err, post) {
      if (err) {
        return next(new Error("Find post(" + comment.Post + ") via comment(" + comment._id + ") failed: " + err));
      } else if (!post) {
        res.statusCode = 404;
        return res.end();
      } else if (post.AllowComments) {
        return savePostComment();
      } else {
        return next(new Error("This post is not allowed to publish comment."));
      }
    });
  } else {
    return saveGuestbookComment();
  }
};

exports.update = function(req, res, next) {
  var comment;
  comment = req.comment;
  comment = _.extend(comment, req.body);
  return comment.save(function(err) {
    if (err) {
      return next(new Error("Update comment(" + comment._id + ") failed: " + err));
    } else {
      return res.jsonp(comment);
    }
  });
};

exports["delete"] = function(req, res, next) {
  var comment, postId;
  comment = req.comment;
  if (comment.Post) {
    postId = comment.Post;
    return async.waterfall([
      function(callback) {
        return Comment.remove({
          _id: comment._id
        }).exec(function(err) {
          if (err) {
            return callback("Delete comment(" + comment._id + ") failed: " + err);
          } else {
            return callback(null);
          }
        });
      }, function(callback) {
        return Post.findOne({
          _id: postId
        }).exec(function(err, post) {
          if (err) {
            return callback("Find post" + postId + " via comment" + comment.Content + " failed: " + err);
          } else if (!post) {
            res.statusCode = 404;
            return res.end();
          } else {
            return callback(null, post);
          }
        });
      }, function(post, callback) {
        return Comment.find({
          Post: postId
        }).sort("CreateDate").select("_id").exec(function(err, comments) {
          if (err) {
            return callback("Get remaining comments by postId" + postId + " failed: " + err);
          } else {
            return callback(null, post, comments);
          }
        });
      }, function(post, comments, callback) {
        post.Comments = comments;
        return post.save(function(err) {
          if (err) {
            return callback("Update post with comments failed: " + err);
          } else {
            return callback(null);
          }
        });
      }
    ], function(err, result) {
      if (err) {
        return next(new Error(err));
      } else {
        return res.jsonp("Delete comment successfully!");
      }
    });
  } else {
    return Comment.remove({
      _id: comment._id
    }).exec(function(err) {
      if (err) {
        return next(new Error("Delete comment(" + comment._id + ") failed: " + err));
      } else {
        return res.jsonp("Delete comment successfully!");
      }
    });
  }
};
