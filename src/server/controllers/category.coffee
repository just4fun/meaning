mongoose = require "mongoose"
Category = mongoose.model "Category"
_ = require "lodash"

exports.get = (req, res) ->
  res.jsonp req.category

exports.getById = (req, res, next, id) ->
  Category.findOne({_id: id})
  .exec (err, category) ->
      if err
        return next(err)
      if !category
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
      next new Error "Create category failed: #{err}"
    else
      res.jsonp category

exports.update = (req, res, next) ->
  category = req.category
  category = _.extend(category, req.body)
  category.save (err) ->
    if err
      next new Error "Update category failed: #{err}"
    else
      res.jsonp category