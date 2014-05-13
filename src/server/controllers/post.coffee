mongoose = require "mongoose"
Post = mongoose.model "Post"
User = mongoose.model "User"
_ = require "lodash"

exports.get = (req, res) ->
  res.jsonp req.post

exports.getList = (req, res) ->
  res.jsonp req.posts

exports.getById = (req, res, next, id) ->
  Post.findById(id).populate('Author', 'Username').exec (err, post) ->
    if err
      return next(err)
    if !post
      return next(new Error('Failed to load post ' + id))
    if !req.headers["view-from-admin-console"]
      post.Views++
    post.save (err) ->
      if err
        next new Error "Update post views failed. #{err}"
      else
        req.post = post
        next()

exports.getListByAuthor = (req, res, next, author) ->
  User.findOne({Username: author}).exec (err, user) ->
    if err
      return next(err)
    if !user
      res.statusCode = 404
      res.end()
    else
      Post.find({Author: user._id}).populate('Author', 'Username').sort('-CreateDate').exec (err, posts) ->
        if err
          return next(err)
        if !posts
          return next(new Error('Failed to load posts of ' + author))
        req.posts = posts
        next()

exports.list = (req, res) ->
  Post.find().populate('Author', 'Username').sort('-CreateDate').exec (err, posts) ->
    if err
      next new Error "Show post list failed. #{err}"
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