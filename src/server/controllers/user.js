var Post, User, async, md5, mongoose, _;

mongoose = require("mongoose");

User = mongoose.model("User");

Post = mongoose.model("Post");

md5 = require("MD5");

_ = require("lodash");

async = require("async");

exports.login = function(req, res, next) {
  return User.findOne({
    UserName: req.body.UserName,
    Password: md5(req.body.Password)
  }).exec(function(err, user) {
    var now, token;
    if (err) {
      return next(new Error("Login failed: " + err));
    } else if (!user) {
      return next(new Error("UserName or Password is incorrect."));
    } else {
      now = new Date();
      token = md5(user.UserName + now);
      user.Token = token;
      user.LastLoginDate = now;
      return user.save(function(err) {
        if (err) {
          return next(new Error("Update token and last login date failed: " + err));
        } else {
          res.setHeader("meaning-token", token);
          return res.jsonp({
            _id: user._id,
            UserName: user.UserName,
            Email: user.Email,
            Role: user.Role
          });
        }
      });
    }
  });
};

exports.get = function(req, res) {
  return res.jsonp(req.user);
};

exports.getById = function(req, res, next, userId) {
  var excludeFields;
  excludeFields = "";
  if (req.method !== "PUT") {
    excludeFields = "-Password -Token";
  }
  return User.findOne({
    _id: userId
  }).select(excludeFields).exec(function(err, user) {
    if (err) {
      return next(new Error("Find user(" + userId + ") failed: " + err));
    } else if (!user) {
      res.statusCode = 404;
      return res.end();
    } else {
      req.user = user;
      return next();
    }
  });
};

exports.list = function(req, res, next) {
  var pageIndex, perPage;
  pageIndex = req.param("pageIndex");
  perPage = pageIndex != null ? 10 : 9999;
  pageIndex = Math.max(0, pageIndex);
  return async.parallel({
    totalCount: function(callback) {
      return User.count().exec(function(err, count) {
        if (err) {
          return callback("Count users failed: " + err);
        } else {
          return callback(null, count);
        }
      });
    },
    list: function(callback) {
      return User.find().sort("-CreateDate").select("-Password -Token").skip(pageIndex * perPage).limit(perPage).exec(function(err, users) {
        if (err) {
          return callback("Show user list failed: " + err);
        } else {
          return callback(null, users);
        }
      });
    }
  }, function(err, results) {
    if (err) {
      return next(new Error(err));
    } else {
      return res.jsonp({
        list: results.list,
        totalCount: results.totalCount
      });
    }
  });
};

exports.create = function(req, res, next) {
  var user;
  req.body.Password = md5(req.body.Password);
  user = new User(req.body);
  return user.save(function(err) {
    if (err) {
      return next(new Error("Create user failed: " + err));
    } else {
      return res.jsonp(user);
    }
  });
};

exports.update = function(req, res, next) {
  var newUser, oldUser, user;
  oldUser = req.user;
  newUser = req.body;
  if (!newUser.Password) {
    newUser.Password = oldUser.Password;
  } else {
    newUser.Password = md5(newUser.Password);
  }
  user = _.extend(oldUser, newUser);
  return user.save(function(err) {
    if (err) {
      return next(new Error("Update user(" + user._id + ") failed: " + err));
    } else {
      return res.jsonp(user);
    }
  });
};

exports["delete"] = function(req, res, next) {
  var user;
  user = req.user;
  return async.waterfall([
    function(callback) {
      return Post.find({
        Author: user._id
      }).exec(function(err, posts) {
        if (err) {
          return callback(err);
        } else if (posts && posts.length > 0) {
          return callback("There are posts created by this user, please delete these posts first.");
        } else {
          return callback(null, user);
        }
      });
    }, function(user, callback) {
      return User.remove({
        _id: user._id
      }).exec(function(err) {
        if (err) {
          return callback(err);
        } else {
          return callback(null);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      return next(new Error(err));
    } else {
      return res.jsonp("Delete user successfully!");
    }
  });
};
