mongoose = require "mongoose"
Comment = mongoose.model "Comment"
Post = mongoose.model "Post"
_ = require "lodash"
async = require "async"

exports.get = (req, res) ->
  res.jsonp req.comment

exports.getList = (req, res) ->
  res.jsonp req.comments

exports.getById = (req, res, next, commentId) ->
  Comment.findOne({_id: commentId})
  .exec (err, comment) ->
    if err
      next new Error "Find comment(#{commentId}) failed: #{err}"
    else if !comment
      res.statusCode = 404
      res.end()
    else
      req.comment = comment
      next()

exports.list = (req, res, next) ->
  Comment.find()
  .sort("CreateDate")
  .exec (err, comments) ->
    if err
      next new Error "Show comment list failed: #{err}"
    else
      res.jsonp comments

exports.getListByQuery = (req, res, next, query) ->
  filter = {}
  if query is "guestbook"
    filter = {
      Post: {
        $exists: false
      }
    }
  else
    filter = {
      Post: query
    }
  Comment.find(filter)
  .sort("CreateDate")
  .exec (err, comments) ->
    if err
      next new Error "Show comment list by query#{query} failed: #{err}"
    else
      res.jsonp comments

exports.create = (req, res, next) ->
  comment = new Comment(req.body)

  saveComment = () ->
    comment.save (err) ->
      if err
        next new Error "Create comment(#{comment.Content}) failed: #{err}"
      else
        res.jsonp comment

  #check AllowComments if comment is related to a post
  if comment.Post
    Post.findOne({_id: comment.Post})
    .exec (err, post) ->
      if err
        next new Error "Find post(#{comment.Post}) via comment(#{comment._id}) failed: #{err}"
      else if !post
        res.statusCode = 404
        res.end()
      else if post.AllowComments
        saveComment()
      else
        next new Error "This post is not allowed to publish comment."
  else
    saveComment()

exports.update = (req, res, next) ->
  comment = req.comment
  comment = _.extend(comment, req.body)
  comment.save (err) ->
    if err
      next new Error "Update comment(#{comment._id}) failed: #{err}"
    else
      res.jsonp comment

exports.delete = (req, res, next) ->
  comment = req.comment
  Comment.remove({_id: comment._id})
  .exec (err) ->
    if err
      next new Error "Delete comment(#{comment._id}) failed: #{err}"
    else
      res.jsonp "Delete comment successfully!"
