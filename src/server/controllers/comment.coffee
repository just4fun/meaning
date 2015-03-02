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

exports.getFromGuestBook = (req, res, next) ->
  Comment.find({Post: {$exists: false}})
  .sort("CreateDate")
  .exec (err, comments) ->
    if err
      next new Error "Show comment list from guestbook failed: #{err}"
    else
      res.jsonp comments

exports.getListByPost = (req, res, next, postId) ->
  Comment.find({Post: postId})
  .sort("CreateDate")
  .exec (err, comments) ->
    if err
      next new Error "Show comment list by postId(#{postId}) failed: #{err}"
    else
      req.comments = comments
      next()

exports.create = (req, res, next) ->
  comment = new Comment(req.body)

  saveGuestbookComment = () ->
    comment.save (err) ->
      if err
        next new Error "Create comment(#{comment.Content}) failed: #{err}"
      else
        res.jsonp comment

  savePostComment = () ->
    postId = comment.Post
    async.waterfall [
      #create comment first
      (callback) ->
        comment.save (err) ->
          if err
            callback "Create comment(#{comment.Content}) failed: #{err}"
          else
            callback null
      #then get post
      (callback) ->
        Post.findOne({_id: postId})
        .exec (err, post) ->
          if err
            callback "Find post#{postId} via comment#{comment.Content} failed: #{err}"
          else if !post
            res.statusCode = 404
            res.end()
          else
            callback null, post
      #then get remaining comments
      (post, callback) ->
        Comment.find({Post: postId})
        .sort("CreateDate")
        .select("_id")
        .exec (err, comments) ->
          if err
            callback "Get remaining comments by postId#{postId} failed: #{err}"
          else
            callback null, post, comments
      #at last, save post with comments
      (post, comments, callback) ->
        post.Comments = comments
        post.save (err) ->
          if err
            callback "Update post with comments failed: #{err}"
          else
            callback null
    ], (err, result) ->
      if err
        next new Error err
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
        savePostComment()
      else
        next new Error "This post is not allowed to publish comment."
  else
    saveGuestbookComment()

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

  if comment.Post
    postId = comment.Post
    async.waterfall [
      #delete comment first
      (callback) ->
        Comment.remove({_id: comment._id})
        .exec (err) ->
          if err
            callback "Delete comment(#{comment._id}) failed: #{err}"
          else
            callback null
      #then get post
      (callback) ->
        Post.findOne({_id: postId})
        .exec (err, post) ->
          if err
            callback "Find post#{postId} via comment#{comment.Content} failed: #{err}"
          else if !post
            res.statusCode = 404
            res.end()
          else
            callback null, post
      #then get remaining comments
      (post, callback) ->
        Comment.find({Post: postId})
        .sort("CreateDate")
        .select("_id")
        .exec (err, comments) ->
          if err
            callback "Get remaining comments by postId#{postId} failed: #{err}"
          else
            callback null, post, comments
      #at last, save post with comments
      (post, comments, callback) ->
        post.Comments = comments
        post.save (err) ->
          if err
            callback "Update post with comments failed: #{err}"
          else
            callback null
    ], (err, result) ->
      if err
        next new Error err
      else
        res.jsonp "Delete comment successfully!"
  else
    Comment.remove({_id: comment._id})
    .exec (err) ->
      if err
        next new Error "Delete comment(#{comment._id}) failed: #{err}"
      else
        res.jsonp "Delete comment successfully!"
