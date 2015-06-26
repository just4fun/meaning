var mongoose = require("mongoose");
var Post = mongoose.model("Post");
var User = mongoose.model("User");
var Tag = mongoose.model("Tag");
var Category = mongoose.model("Category");
var Comment = mongoose.model("Comment");
var _ = require("lodash");
var async = require("async");

exports.get = function(req, res) {
  res.jsonp(req.post);
};

exports.getList = function(req, res) {
  changePostUrlWithDate(req.posts);
  res.jsonp(req.posts);
};

exports.getCount = function(req, res) {
  var filter = {};

  // check user role
  if (req.headers["login-user"]) {
    var loginUser = JSON.parse(req.headers["login-user"]);
    if (loginUser && loginUser.Role !== "Admin") {
      filter.Author = loginUser._id;
    }
  } else {
    return next(new Error("'login-user' header is required."));
  }

  var getCount = function(status, callback) {
    filter.Status = status;
    Post.count(filter).exec(function(err, count) {
      if (err) {
        callback("Get " + status + " posts count failed: " + err);
      } else {
        callback(null, count);
      }
    });
  };

  async.parallel({
    publishedCount: function(callback) {
      return getCount("Published", callback);
    },
    draftCount: function(callback) {
      return getCount("Draft", callback);
    },
    trashCount: function(callback) {
      return getCount("Trash", callback);
    }
  }, function(err, results) {
    if (err) {
      next(new Error(err));
    } else {
      var postCounts = {
        published: results.publishedCount,
        draft: results.draftCount,
        trash: results.trashCount,
        all: results.publishedCount + results.draftCount + results.trashCount
      };
      res.jsonp(postCounts);
    }
  });
};

exports.getByUrl = function(req, res, next, url) {
  var param = {
    Url: url
  };
  if (!req.headers["from-admin-console"]) {
    param.Status = "Published";
  }

  Post.findOne(param)
    .populate("Author", "UserName")
    .populate("Tags", "TagName")
    .populate("Category", "CategoryName")
    .exec(function(err, post) {
      if (err) {
        next(new Error("Find post(" + url + ") failed: " + err));
      } else if (!post) {
        res.statusCode = 404;
        res.end();
      } else {
        if (!req.headers["from-admin-console"]) {
          post.Views++;
        }
        post.save(function(err) {
          if (err) {
            next(new Error("Update post views failed: " + err));
          } else {
            req.post = post;
            next();
          }
        });
      }
  });
};

exports.getListByAuthor = function(req, res, next, author) {
  User.findOne({
    UserName: author
  }).exec(function(err, user) {
    if (err) {
      next(new Error("Find user(" + author + ") failed: " + err));
    } else if (!user) {
      res.statusCode = 404;
      res.end();
    } else {
      Post.find({
        Author: user._id,
        Status: "Published"
      }).populate("Author", "UserName")
        .populate("Tags", "TagName")
        .populate("Category", "CategoryName")
        .sort("-CreateDate")
        .exec(function(err, posts) {
          if (err) {
            next(new Error("Failed to load posts of author(" + author + "): " + err));
          } else {
            req.posts = posts;
            next();
          }
        });
    }
  });
};

exports.getListByTag = function(req, res, next, tagName) {
  Tag.find({
    TagName: tagName
  }).populate("Post").exec(function(err, tags) {
    var index, t, _i, _len;
    if (err) {
      next(new Error("Find tag(" + tagName + ") failed: " + err));
    } else if (!tags || tags.length === 0) {
      res.statusCode = 404;
      res.end();
    } else {
      // remove tag whose post is draft
      for (index = _i = 0, _len = tags.length; _i < _len; index = ++_i) {
        t = tags[index];
        if (t.Post.Status !== "Published") {
          tags.splice(index, 1);
        }
      }

      // populate the field of populated doc
      async.map(tags, (function(tag, callback) {
        tag.Post.populate("Author Category Tags", "UserName CategoryName TagName", function(err, post) {
          if (err) {
            callback(err);
          } else {
            callback(null, post);
          }
        });
      }), function(err, posts) {
        if (err) {
          next(err);
        } else {
          req.posts = posts;
          next();
        }
      });
    }
  });
};

exports.getListByCategory = function(req, res, next, categoryName) {
  Category.findOne({
    CategoryName: categoryName
  }).exec(function(err, category) {
    if (err) {
      next(new Error("Find category(" + categoryName + ") failed: " + err));
    } else if (!category) {
      res.statusCode = 404;
      res.end();
    } else {
      Post.find({
        Category: category._id,
        Status: "Published"
      }).populate("Author", "UserName")
        .populate("Tags", "TagName")
        .populate("Category", "CategoryName")
        .sort("-CreateDate")
        .exec(function(err, posts) {
          if (err) {
            next(new Error("Failed to load posts of category(" + categoryName + "): " + err));
          } else {
            req.posts = posts;
            next();
          }
        });
    }
  });
};

exports.getListByStatus = function(req, res, next, status) {
  var filter = {
    Status: status
  };

  // from admin console
  if (req.headers["login-user"]) {
    var loginUser = JSON.parse(req.headers["login-user"]);
    if (loginUser && loginUser.Role !== "Admin") {
      filter.Author = loginUser._id;
    }
  }
  // from front site
  else if (status !== "Published") {
    return next(new Error("You are only allowed to view published posts."));
  }

  Post.find(filter)
    .populate("Author", "UserName")
    .populate("Tags", "TagName")
    .populate("Category", "CategoryName")
    .sort("-CreateDate")
    .exec(function(err, posts) {
      if (err) {
        next(new Error("Failed to load posts of status(" + status + "): " + err));
      } else {
        req.posts = posts;
        next();
      }
  });
};

exports.list = function(req, res, next) {
  var filter = {};

  if (req.headers["login-user"]) {
    var loginUser = JSON.parse(req.headers["login-user"]);
    if (loginUser && loginUser.Role !== "Admin") {
      filter.Author = loginUser._id;
    }
  } else {
    return next(new Error("'login-user' header is required."));
  }

  Post.find(filter)
    .populate("Author", "UserName")
    .populate("Tags", "TagName")
    .populate("Category", "CategoryName")
    .sort("-CreateDate")
    .exec(function(err, posts) {
      if (err) {
        next(new Error("Show post list failed: " + err));
      } else {
        changePostUrlWithDate(posts);
        res.jsonp(posts);
      }
    });
};

exports.create = function(req, res, next) {
  // handle tags
  var t, _i, _len;
  var newTags = getValidTags(req.body.Tags || "");

  // limit tags count to FIVE
  if (newTags.length > 5) {
    return next(new Error("The maximum of tags count is FIVE."));
  }

  // limit length of each tag to FIVE
  for (_i = 0, _len = newTags.length; _i < _len; _i++) {
    t = newTags[_i];
    if (t.length > 5) {
      return next(new Error("The maximum of tag length is FIVE."));
    }
  }

  req.body.Tags = [];

  // create post
  var post = new Post(req.body);
  savePostWithTags(req, res, next, post, newTags);
};

exports.update = function(req, res, next) {
  // handle tags
  var t, _i, _len;
  var newTags = getValidTags(req.body.Tags || "");

  // limit tags count to FIVE
  if (newTags.length > 5) {
    return next(new Error("The maximum of tags count is FIVE."));
  }

  // limit length of each tag to FIVE
  for (_i = 0, _len = newTags.length; _i < _len; _i++) {
    t = newTags[_i];
    if (t.length > 5) {
      return next(new Error("The maximum of tag length is FIVE."));
    }
  }

  req.body.Tags = [];

  var post = req.post;
  post = _.extend(post, req.body);

  // delete old tags
  Tag.remove({
    Post: req.body._id
  }).exec(function(err) {
    if (err) {
      next(new Error("Remove post tags failed: " + err));
    } else {
      post.EditDate = new Date();
      // update post
      savePostWithTags(req, res, next, post, newTags);
    }
  });
};

exports["delete"] = function(req, res, next) {
  var post = req.post;
  if (post.Status !== "Trash") {
    return next(new Error("You can only delete trash post."));
  }

  async.waterfall([

    // delete tags first
    function(callback) {
      Tag.remove({
        Post: post._id
      }).exec(function(err) {
        if (err) {
          callback("Remove post tags failed: " + err);
        } else {
          callback(null);
        }
      });
    },

    // then delete comments
    function(callback) {
      Comment.remove({
        Post: post._id
      }).exec(function(err) {
        if (err) {
          callback("Remove post comments failed: " + err);
        } else {
          callback(null);
        }
      });
    },

    // at last, delete post
    function(callback) {
      Post.remove({
        _id: post._id
      }).exec(function(err) {
        if (err) {
          callback("Delete post failed: " + err);
        } else {
          callback(null);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      next(new Error(err));
    } else {
      res.jsonp("Delete post successfully!");
    }
  });
};

var getValidTags = function(tagStr) {
  var newTags, t, tags, _i, _len;
  if (!tagStr) {
    return [];
  }
  newTags = [];
  tags = tagStr.split(",");

  // remove trim items
  for (_i = 0, _len = tags.length; _i < _len; _i++) {
    t = tags[_i];
    if (t.trim().length !== 0) {
      newTags.push(t.trim());
    }
  }

  // remove duplicate items
  return newTags.unique();
};

var savePostWithTags = function(req, res, next, post, newTags) {
  post.save(function(err) {
    var t, tags, tempPosts, _i, _len;
    if (err) {
      next(new Error("Save post(" + post._id + ") failed: " + err));
    } else {
      // create tags
      if (newTags.length > 0) {
        tags = [];
        for (_i = 0, _len = newTags.length; _i < _len; _i++) {
          t = newTags[_i];
          tags.push({
            TagName: t,
            Post: post._id
          });
        }

        Tag.create(tags, function(err) {
          var _j, _len1;
          if (err) {
            next(new Error("Create tags failed when creating post: " + err));
          } else {
            newTags = Array.prototype.slice.call(arguments, 1);
            // update post
            post.Tags = [];
            for (_j = 0, _len1 = newTags.length; _j < _len1; _j++) {
              t = newTags[_j];
              post.Tags.push(t._id);
            }

            post.save(function(err) {
              if (err) {
                next(new Error("Update post(" + post._id + ") failed: " + err));
              } else {
                var tempPosts = [];
                tempPosts.push(post);
                changePostUrlWithDate(tempPosts);
                res.jsonp(post);
              }
            });
          }
        });
      } else {
        tempPosts = [];
        tempPosts.push(post);
        changePostUrlWithDate(tempPosts);
        res.jsonp(post);
      }
    }
  });
};

var changePostUrlWithDate = function(posts) {
  var date, day, month, p, year, _i, _len, _results;
  if (!posts || posts.length === 0) {
    return;
  }
  _results = [];
  for (_i = 0, _len = posts.length; _i < _len; _i++) {
    p = posts[_i];
    date = new Date(p.CreateDate);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
    _results.push(p.Url = "" + year + "/" + month + "/" + day + "/" + p.Url);
  }
  return _results;
};

Array.prototype.unique = function() {
  var key, output, value, _i, _ref, _results;
  output = {};
  for (key = _i = 0, _ref = this.length; 0 <= _ref ? _i < _ref : _i > _ref; key = 0 <= _ref ? ++_i : --_i) {
    output[this[key]] = this[key];
  }
  _results = [];
  for (key in output) {
    value = output[key];
    _results.push(value);
  }
  return _results;
};
