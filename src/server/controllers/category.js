var Category, Post, async, mongoose, _;

mongoose = require("mongoose");

Category = mongoose.model("Category");

Post = mongoose.model("Post");

_ = require("lodash");

async = require("async");

exports.get = function(req, res) {
  return res.jsonp(req.category);
};

exports.getById = function(req, res, next, categoryId) {
  return Category.findOne({
    _id: categoryId
  }).exec(function(err, category) {
    if (err) {
      return next(new Error("Find category(" + categoryId + ") failed: " + err));
    } else if (!category) {
      res.statusCode = 404;
      return res.end();
    } else {
      req.category = category;
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
      return Category.count().exec(function(err, count) {
        if (err) {
          return callback("Count categories failed: " + err);
        } else {
          return callback(null, count);
        }
      });
    },
    list: function(callback) {
      return Category.find().sort("-CreateDate").skip(pageIndex * perPage).limit(perPage).exec(function(err, categories) {
        if (err) {
          return callback("Show category list failed: " + err);
        } else {
          return callback(null, categories);
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
  var category;
  category = new Category(req.body);
  return category.save(function(err) {
    if (err) {
      return next(new Error("Create category(" + category.CategoryName + ") failed: " + err));
    } else {
      return res.jsonp(category);
    }
  });
};

exports.update = function(req, res, next) {
  var category;
  category = req.category;
  category = _.extend(category, req.body);
  return category.save(function(err) {
    if (err) {
      return next(new Error("Update category(" + category._id + ") failed: " + err));
    } else {
      return res.jsonp(category);
    }
  });
};

exports["delete"] = function(req, res, next) {
  var category;
  category = req.category;
  return async.waterfall([
    function(callback) {
      return Post.find({
        Category: category._id
      }).exec(function(err, posts) {
        if (err) {
          return callback(err);
        } else if (posts && posts.length > 0) {
          return callback("There are posts under this category, please delete these posts first.");
        } else {
          return callback(null, category);
        }
      });
    }, function(category, callback) {
      return Category.remove({
        _id: category._id
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
      return res.jsonp("Delete category successfully!");
    }
  });
};
