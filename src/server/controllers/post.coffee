mongoose = require "mongoose"
Post = mongoose.model "Post"
_ = require "lodash"

exports.get = (req, res) ->
  res.jsonp req.post

exports.getById = (req, res, next, id) ->
  Post.findById(id).exec (err, post) ->
    if err
      return next(err)
    if !post
      return next(new Error('Failed to load post ' + id))
    post.Views++
    post.save (err) ->
      if err
        next new Error "Update post views failed. #{err}"
      else
        req.post = post
        next()

exports.list = (req, res) ->
  Post.find().sort('-CreateDate').exec (err, posts) ->
    if err
      res.render 'error',
        status: 500
    else
      res.jsonp posts

exports.create = (req, res) ->
  req.body.Views = 0
  post = new Post(req.body)
  post.save (err) ->
    if err
      next new Error "Create post failed. #{err}"
    else
      res.jsonp post

exports.update = (req, res) ->
  post = req.post
  post = _.extend(post, req.body);

  post.save (err) ->
    if err
      next new Error "Update post failed. #{err}"
    else
      res.jsonp post