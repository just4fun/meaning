var mongoose = require("mongoose");
var User = mongoose.model("User");
var Post = mongoose.model("Post");
var md5 = require("MD5");
var _ = require("lodash");
var async = require("async");

exports.login = function(req, res, next) {
  User.findOne({
    UserName: req.body.UserName,
    Password: md5(req.body.Password)
  }).exec(function(err, user) {
    if (err) {
      next(new Error("Login failed: " + err));
    } else if (!user) {
      next(new Error("UserName or Password is incorrect."));
    } else {
      // update token and last login date
      var now = new Date();
      var token = md5(user.UserName + now);

      user.Token = token;
      user.LastLoginDate = now;
      user.save(function(err) {
        if (err) {
          next(new Error("Update token and last login date failed: " + err));
        } else {
          res.setHeader("meaning-token", token);
          res.jsonp({
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

// -------------------------------------------------------------

exports.get = function(req, res) {
  res.jsonp(req.user);
};

exports.getById = function(req, res, next, userId) {
  // for user update
  var excludeFields = "";
  if (req.method !== "PUT") {
    excludeFields = "-Password -Token";
  }

  User.findOne({
    _id: userId
  })
    // exclude sensitive fields
    .select(excludeFields)
    .exec(function(err, user) {
      if (err) {
        next(new Error("Find user(" + userId + ") failed: " + err));
      } else if (!user) {
        res.statusCode = 404;
        res.end();
      } else {
        req.user = user;
        next();
      }
    });
};

exports.list = function(req, res, next) {
  var pageIndex = req.param("pageIndex");
  var perPage = pageIndex != null ? 10 : 9999;
  pageIndex = Math.max(0, pageIndex);

  async.parallel({
    totalCount: function(callback) {
      User.count().exec(function(err, count) {
        if (err) {
          callback("Count users failed: " + err);
        } else {
          callback(null, count);
        }
      });
    },

    list: function(callback) {
      User.find()
        .sort("-CreateDate")
        // exclude sensitive fields
        .select("-Password -Token")
        .skip(pageIndex * perPage)
        .limit(perPage)
        .exec(function(err, users) {
          if (err) {
            callback("Show user list failed: " + err);
          } else {
            callback(null, users);
          }
      });
    }
  }, function(err, results) {
    if (err) {
      next(new Error(err));
    } else {
      res.jsonp({
        list: results.list,
        totalCount: results.totalCount
      });
    }
  });
};

exports.create = function(req, res, next) {
  req.body.Password = md5(req.body.Password);
  var user = new User(req.body);
  user.save(function(err) {
    if (err) {
      next(new Error("Create user failed: " + err));
    } else {
      res.jsonp(user);
    }
  });
};

exports.update = function(req, res, next) {
  var oldUser = req.user;
  var newUser = req.body;

  if (!newUser.Password) {
    newUser.Password = oldUser.Password;
  } else {
    newUser.Password = md5(newUser.Password);
  }

  // _.extend({name: 'moe'}, {age: 50});
  // => {name: 'moe', age: 50}
  var user = _.extend(oldUser, newUser);
  user.save(function(err) {
    if (err) {
      next(new Error("Update user(" + user._id + ") failed: " + err));
    } else {
      res.jsonp(user);
    }
  });
};

exports["delete"] = function(req, res, next) {
  var user = req.user;

  async.waterfall([
    function(callback) {
      Post.find({
        Author: user._id
      }).exec(function(err, posts) {
        if (err) {
          callback(err);
        } else if (posts && posts.length > 0) {
          callback("There are posts created by this user, please delete these posts first.");
        } else {
          callback(null, user);
        }
      });
    },

    function(user, callback) {
      User.remove({
        _id: user._id
      }).exec(function(err) {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      next(new Error(err));
    } else {
      res.jsonp("Delete user successfully!");
    }
  });
};
