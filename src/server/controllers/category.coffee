mongoose = require "mongoose"
Category = mongoose.model "Category"
Post = mongoose.model "Post"
_ = require "lodash"
async = require "async"

exports.get = (req, res) ->
  res.jsonp req.category

exports.getById = (req, res, next, categoryId) ->
  Category.findOne({_id: categoryId})
  .exec (err, category) ->
    if err
      next new Error "Find category(#{categoryId}) failed: #{err}"
    else if !category
      res.statusCode = 404
      res.end()
    else
      req.category = category
      next()

exports.list = (req, res, next) ->
  Category.find()
  .sort('-CreateDate')
  .exec (err, categories) ->
    if err
      next new Error "Show category list failed: #{err}"
    else
      res.jsonp categories

exports.create = (req, res, next) ->
  category = new Category(req.body)
  category.save (err) ->
    if err
      next new Error "Create category(#{category.CategoryName}) failed: #{err}"
    else
      res.jsonp category

exports.update = (req, res, next) ->
  category = req.category
  category = _.extend(category, req.body)
  category.save (err) ->
    if err
      next new Error "Update category(#{category._id}) failed: #{err}"
    else
      res.jsonp category

exports.delete = (req, res, next) ->
  category = req.category

  async.waterfall [
    (callback) ->
      Post.find({Category: category._id})
      .exec (err, posts) ->
        if err
          callback err
        else if posts and posts.length > 0
          callback "There are posts under this category, please delete these posts first."
        else
          callback null, category
    (category, callback) ->
      Category.remove({_id: category._id})
      .exec (err) ->
        if err
          callback err
        else
          callback null

  ], (err, result) ->
    if err
      next new Error err
    else
      res.jsonp "Delete category successfully!"
