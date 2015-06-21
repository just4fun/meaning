var Category, mongoose;

mongoose = require("mongoose");

Category = mongoose.model("Category");

module.exports = function() {
  return function(req, res, next) {
    if (!req.body.CategoryName) {
      return next(new Error("No category name."));
    }
    return Category.find().exec(function(err, categories) {
      var category, _i, _j, _len, _len1;
      if (err) {
        return next(new Error("Show category list failed: " + err));
      } else if (categories && categories.length > 0) {
        if (req.category) {
          for (_i = 0, _len = categories.length; _i < _len; _i++) {
            category = categories[_i];
            if (category.CategoryName === req.body.CategoryName && category._id.toString() !== req.body._id) {
              next(new Error("This name already exists."));
              return;
            }
          }
        } else {
          for (_j = 0, _len1 = categories.length; _j < _len1; _j++) {
            category = categories[_j];
            if (category.CategoryName === req.body.CategoryName) {
              next(new Error("This name already exists."));
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
