mongoose = require "mongoose"
Post = mongoose.model "Post"
User = mongoose.model "User"
Tag = mongoose.model "Tag"
_ = require "lodash"

exports.get = (req, res) ->
  res.jsonp req.post

exports.getList = (req, res) ->
  changePostUrlWithDate(req.posts)
  res.jsonp req.posts

exports.getByUrl = (req, res, next, url) ->
  Post.findOne({Url: url}).populate('Author', 'Username').populate('Tags', 'TagName').exec (err, post) ->
    if err
      return next(err)
    if !post
      res.statusCode = 404
      res.end()
    else
      if !req.headers["view-from-admin-console"]
        post.Views++
      post.save (err) ->
        if err
          next new Error "Update post views failed: #{err}"
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
      Post.find({Author: user._id}).populate('Author', 'Username').populate('Tags', 'TagName').sort('-CreateDate').exec (err, posts) ->
        if err
          return next(err)
        if !posts
          return next(new Error('Failed to load posts of author: ' + author))
        req.posts = posts
        next()

exports.getListByTag = (req, res, next, tagName) ->
  Tag.findOne({TagName: tagName}).exec (err, tag) ->
    if err
      return next(err)
    if !tag
      res.statusCode = 404
      res.end()
    else
      Post.find().populate('Author', 'Username').populate('Tags', 'TagName').sort('-CreateDate').exec (err, posts) ->
        if err
          return next(err)
        if !posts
          return next(new Error('Failed to load posts of tag: ' + tagName))
        #todo: change filter after find() to find with filter
        filter = []
        for p in posts
          for t in p.Tags when t.TagName is tagName
            filter.push p
            break;
        req.posts = filter
        next()

exports.list = (req, res, next) ->
  Post.find().populate('Author', 'Username').populate('Tags', 'TagName').sort('-CreateDate').exec (err, posts) ->
    if err
      next new Error "Show post list failed: #{err}"
    else
      changePostUrlWithDate(posts)
      res.jsonp posts

exports.create = (req, res, next) ->
  #handle tags
  newTags = getValidTags(req.body.Tags || "")
  req.body.Tags = []

  post = new Post(req.body)
  #create post
  savePostWithTags(req, res, next, post, newTags)

exports.update = (req, res, next) ->
  #handle tags
  newTags = getValidTags(req.body.Tags || "")
  req.body.Tags = []

  post = req.post
  post = _.extend(post, req.body);

  #delete old tags
  Tag.remove({Post: req.body._id}).exec (err) ->
    if err
      next new Error "Remove post tags failed: #{err}"
    else
      post.EditDate = new Date()
      #update post
      savePostWithTags(req, res, next, post, newTags)

getValidTags = (tagStr) ->
  return [] if !tagStr
  newTags = []
  tags = tagStr.split(",")
  #remove trim items
  for t in tags when t.trim().length isnt 0
    newTags.push t.trim()
  #remove duplicate items
  return newTags.unique()

savePostWithTags =  (req, res, next, post, newTags) ->
  post.save (err) ->
    if err
      next new Error "Save post failed: #{err}"
    else
      #create tags
      if newTags.length > 0
        tags = []
        for t in newTags
          tags.push
            TagName: t
            Post: post._id

        Tag.create tags, (err) ->
          if err
            next new Error "Create tags failed when creating post: #{err}"
          else
            newTags = Array.prototype.slice.call(arguments, 1)
            #update post
            post.Tags = []
            for t in newTags
              post.Tags.push t._id

            post.save (err) ->
              if err
                next new Error "Update post failed: #{err}"
              else
                tempPosts = []
                tempPosts.push(post)
                changePostUrlWithDate(tempPosts)
                res.jsonp post
      else
        tempPosts = []
        tempPosts.push(post)
        changePostUrlWithDate(tempPosts)
        res.jsonp post

changePostUrlWithDate = (posts) ->
  return if !posts or posts.length is 0
  for p in posts
    date = new Date(p.CreateDate)
    year = date.getFullYear()
    month = date.getMonth() + 1
    day = date.getDate()
    p.Url = "#{year}/#{month}/#{day}/#{p.Url}"

#remove duplicate items from array
Array::unique = ->
  output = {}
  output[@[key]] = @[key] for key in [0...@length]
  value for key, value of output