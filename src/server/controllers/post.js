var Category, Comment, Post, Tag, User, async, changePostUrlWithDate, getValidTags, mongoose, savePostWithTags, _;

mongoose = require("mongoose");

Post = mongoose.model("Post");

User = mongoose.model("User");

Tag = mongoose.model("Tag");

Category = mongoose.model("Category");

Comment = mongoose.model("Comment");

_ = require("lodash");

async = require("async");

exports.get = function(req, res) {
  return res.jsonp(req.post);
};

exports.getList = function(req, res) {
  changePostUrlWithDate(req.posts);
  return res.jsonp(req.posts);
};

exports.getCount = function(req, res) {
  var filter, getCount, loginUser;
  filter = {};
  if (req.headers["login-user"]) {
    loginUser = JSON.parse(req.headers["login-user"]);
    if (loginUser && loginUser.Role !== "Admin") {
      filter.Author = loginUser._id;
    }
  } else {
    return next(new Error("'login-user' header is required."));
  }
  getCount = function(status, callback) {
    filter.Status = status;
    return Post.count(filter).exec(function(err, count) {
      if (err) {
        return callback("Get " + status + " posts count failed: " + err);
      } else {
        return callback(null, count);
      }
    });
  };
  return async.parallel({
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
    var postCounts;
    if (err) {
      return next(new Error(err));
    } else {
      postCounts = {
        published: results.publishedCount,
        draft: results.draftCount,
        trash: results.trashCount,
        all: results.publishedCount + results.draftCount + results.trashCount
      };
      return res.jsonp(postCounts);
    }
  });
};

exports.getByUrl = function(req, res, next, url) {
  var param;
  param = {
    Url: url
  };
  if (!req.headers["from-admin-console"]) {
    param.Status = "Published";
  }
  return Post.findOne(param).populate("Author", "UserName").populate("Tags", "TagName").populate("Category", "CategoryName").exec(function(err, post) {
    if (err) {
      return next(new Error("Find post(" + url + ") failed: " + err));
    } else if (!post) {
      res.statusCode = 404;
      return res.end();
    } else {
      if (!req.headers["from-admin-console"]) {
        post.Views++;
      }
      return post.save(function(err) {
        if (err) {
          return next(new Error("Update post views failed: " + err));
        } else {
          req.post = post;
          return next();
        }
      });
    }
  });
};

exports.getListByAuthor = function(req, res, next, author) {
  return User.findOne({
    UserName: author
  }).exec(function(err, user) {
    if (err) {
      return next(new Error("Find user(" + author + ") failed: " + err));
    } else if (!user) {
      res.statusCode = 404;
      return res.end();
    } else {
      return Post.find({
        Author: user._id,
        Status: "Published"
      }).populate("Author", "UserName").populate("Tags", "TagName").populate("Category", "CategoryName").sort("-CreateDate").exec(function(err, posts) {
        if (err) {
          return next(new Error("Failed to load posts of author(" + author + "): " + err));
        } else {
          req.posts = posts;
          return next();
        }
      });
    }
  });
};

exports.getListByTag = function(req, res, next, tagName) {
  return Tag.find({
    TagName: tagName
  }).populate("Post").exec(function(err, tags) {
    var index, t, _i, _len;
    if (err) {
      return next(new Error("Find tag(" + tagName + ") failed: " + err));
    } else if (!tags || tags.length === 0) {
      res.statusCode = 404;
      return res.end();
    } else {
      for (index = _i = 0, _len = tags.length; _i < _len; index = ++_i) {
        t = tags[index];
        if (t.Post.Status !== "Published") {
          tags.splice(index, 1);
        }
      }
      return async.map(tags, (function(tag, callback) {
        return tag.Post.populate("Author Category Tags", "UserName CategoryName TagName", function(err, post) {
          if (err) {
            return callback(err);
          } else {
            return callback(null, post);
          }
        });
      }), function(err, posts) {
        if (err) {
          return next(err);
        } else {
          req.posts = posts;
          return next();
        }
      });
    }
  });
};

exports.getListByCategory = function(req, res, next, categoryName) {
  return Category.findOne({
    CategoryName: categoryName
  }).exec(function(err, category) {
    if (err) {
      return next(new Error("Find category(" + categoryName + ") failed: " + err));
    } else if (!category) {
      res.statusCode = 404;
      return res.end();
    } else {
      return Post.find({
        Category: category._id,
        Status: "Published"
      }).populate("Author", "UserName").populate("Tags", "TagName").populate("Category", "CategoryName").sort("-CreateDate").exec(function(err, posts) {
        if (err) {
          return next(new Error("Failed to load posts of category(" + categoryName + "): " + err));
        } else {
          req.posts = posts;
          return next();
        }
      });
    }
  });
};

exports.getListByStatus = function(req, res, next, status) {
  var filter, loginUser;
  filter = {
    Status: status
  };
  if (req.headers["login-user"]) {
    loginUser = JSON.parse(req.headers["login-user"]);
    if (loginUser && loginUser.Role !== "Admin") {
      filter.Author = loginUser._id;
    }
  } else if (status !== "Published") {
    return next(new Error("You are only allowed to view published posts."));
  }
  return Post.find(filter).populate("Author", "UserName").populate("Tags", "TagName").populate("Category", "CategoryName").sort("-CreateDate").exec(function(err, posts) {
    if (err) {
      return next(new Error("Failed to load posts of status(" + status + "): " + err));
    } else {
      req.posts = posts;
      return next();
    }
  });
};

exports.list = function(req, res, next) {
  var filter, loginUser;
  filter = {};
  if (req.headers["login-user"]) {
    loginUser = JSON.parse(req.headers["login-user"]);
    if (loginUser && loginUser.Role !== "Admin") {
      filter.Author = loginUser._id;
    }
  } else {
    return next(new Error("'login-user' header is required."));
  }
  return Post.find(filter).populate("Author", "UserName").populate("Tags", "TagName").populate("Category", "CategoryName").sort("-CreateDate").exec(function(err, posts) {
    if (err) {
      return next(new Error("Show post list failed: " + err));
    } else {
      changePostUrlWithDate(posts);
      return res.jsonp(posts);
    }
  });
};

exports.create = function(req, res, next) {
  var newTags, post, t, _i, _len;
  newTags = getValidTags(req.body.Tags || "");
  if (newTags.length > 5) {
    return next(new Error("The maximum of tags count is FIVE."));
  }
  for (_i = 0, _len = newTags.length; _i < _len; _i++) {
    t = newTags[_i];
    if (t.length > 5) {
      return next(new Error("The maximum of tag length is FIVE."));
    }
  }
  req.body.Tags = [];
  post = new Post(req.body);
  return savePostWithTags(req, res, next, post, newTags);
};

exports.update = function(req, res, next) {
  var newTags, post, t, _i, _len;
  newTags = getValidTags(req.body.Tags || "");
  if (newTags.length > 5) {
    return next(new Error("The maximum of tags count is FIVE."));
  }
  for (_i = 0, _len = newTags.length; _i < _len; _i++) {
    t = newTags[_i];
    if (t.length > 5) {
      return next(new Error("The maximum of tag length is FIVE."));
    }
  }
  req.body.Tags = [];
  post = req.post;
  post = _.extend(post, req.body);
  return Tag.remove({
    Post: req.body._id
  }).exec(function(err) {
    if (err) {
      return next(new Error("Remove post tags failed: " + err));
    } else {
      post.EditDate = new Date();
      return savePostWithTags(req, res, next, post, newTags);
    }
  });
};

exports["delete"] = function(req, res, next) {
  var post;
  post = req.post;
  if (post.Status !== "Trash") {
    return next(new Error("You can only delete trash post."));
  }
  return async.waterfall([
    function(callback) {
      return Tag.remove({
        Post: post._id
      }).exec(function(err) {
        if (err) {
          return callback("Remove post tags failed: " + err);
        } else {
          return callback(null);
        }
      });
    }, function(callback) {
      return Comment.remove({
        Post: post._id
      }).exec(function(err) {
        if (err) {
          return callback("Remove post comments failed: " + err);
        } else {
          return callback(null);
        }
      });
    }, function(callback) {
      return Post.remove({
        _id: post._id
      }).exec(function(err) {
        if (err) {
          return callback("Delete post failed: " + err);
        } else {
          return callback(null);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      return next(new Error(err));
    } else {
      return res.jsonp("Delete post successfully!");
    }
  });
};

getValidTags = function(tagStr) {
  var newTags, t, tags, _i, _len;
  if (!tagStr) {
    return [];
  }
  newTags = [];
  tags = tagStr.split(",");
  for (_i = 0, _len = tags.length; _i < _len; _i++) {
    t = tags[_i];
    if (t.trim().length !== 0) {
      newTags.push(t.trim());
    }
  }
  return newTags.unique();
};

savePostWithTags = function(req, res, next, post, newTags) {
  return post.save(function(err) {
    var t, tags, tempPosts, _i, _len;
    if (err) {
      return next(new Error("Save post(" + post._id + ") failed: " + err));
    } else {
      if (newTags.length > 0) {
        tags = [];
        for (_i = 0, _len = newTags.length; _i < _len; _i++) {
          t = newTags[_i];
          tags.push({
            TagName: t,
            Post: post._id
          });
        }
        return Tag.create(tags, function(err) {
          var _j, _len1;
          if (err) {
            return next(new Error("Create tags failed when creating post: " + err));
          } else {
            newTags = Array.prototype.slice.call(arguments, 1);
            post.Tags = [];
            for (_j = 0, _len1 = newTags.length; _j < _len1; _j++) {
              t = newTags[_j];
              post.Tags.push(t._id);
            }
            return post.save(function(err) {
              var tempPosts;
              if (err) {
                return next(new Error("Update post(" + post._id + ") failed: " + err));
              } else {
                tempPosts = [];
                tempPosts.push(post);
                changePostUrlWithDate(tempPosts);
                return res.jsonp(post);
              }
            });
          }
        });
      } else {
        tempPosts = [];
        tempPosts.push(post);
        changePostUrlWithDate(tempPosts);
        return res.jsonp(post);
      }
    }
  });
};

changePostUrlWithDate = function(posts) {
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
