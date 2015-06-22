var mongoose = require("mongoose");
var Category = mongoose.model("Category");
var Post = mongoose.model("Post");
var _ = require("lodash");
var async = require("async");

exports.get = function(req, res) {
  res.jsonp(req.category);
};

exports.getById = function(req, res, next, categoryId) {
  Category.findOne({
    _id: categoryId
  }).exec(function(err, category) {
    if (err) {
      next(new Error("Find category(" + categoryId + ") failed: " + err));
    } else if (!category) {
      res.statusCode = 404;
      res.end();
    } else {
      req.category = category;
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
      Category.count().exec(function(err, count) {
        if (err) {
          callback("Count categories failed: " + err);
        } else {
          callback(null, count);
        }
      });
    },

    list: function(callback) {
      Category.find().sort("-CreateDate").skip(pageIndex * perPage).limit(perPage).exec(function(err, categories) {
        if (err) {
          callback("Show category list failed: " + err);
        } else {
          callback(null, categories);
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
  var category = new Category(req.body);
  category.save(function(err) {
    if (err) {
      next(new Error("Create category(" + category.CategoryName + ") failed: " + err));
    } else {
      res.jsonp(category);
    }
  });
};

exports.update = function(req, res, next) {
  var category = req.category;
  category = _.extend(category, req.body);
  category.save(function(err) {
    if (err) {
      next(new Error("Update category(" + category._id + ") failed: " + err));
    } else {
      res.jsonp(category);
    }
  });
};

exports["delete"] = function(req, res, next) {
  var category = req.category;

  async.waterfall([
    function(callback) {
      Post.find({
        Category: category._id
      }).exec(function(err, posts) {
        if (err) {
          callback(err);
        } else if (posts && posts.length > 0) {
          callback("There are posts under this category, please delete these posts first.");
        } else {
          callback(null, category);
        }
      });
    },

    function(category, callback) {
      Category.remove({
        _id: category._id
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
      res.jsonp("Delete category successfully!");
    }
  });
};
