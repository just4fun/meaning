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
  pageIndex = req.param("pageIndex")
  perPage = if pageIndex? then 10 else 9999
  pageIndex = Math.max(0, pageIndex)

  async.parallel
    totalCount: (callback) ->
      Category.count().exec (err, count) ->
        if err
          callback "Count categories failed: #{err}"
        else
          callback null, count
    list: (callback) ->
      Category.find()
      .sort("-CreateDate")
      .skip(pageIndex * perPage)
      .limit(perPage)
      .exec (err, categories) ->
        if err
          callback "Show category list failed: #{err}"
        else
          callback null, categories
  , (err, results) ->
    if err
      next new Error err
    else
      res.jsonp {
        list: results.list
        totalCount: results.totalCount
      }

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
