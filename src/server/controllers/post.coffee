mongoose = require "mongoose"
Post = mongoose.model "Post"
User = mongoose.model "User"
Tag = mongoose.model "Tag"
Category = mongoose.model "Category"
_ = require "lodash"
async = require "async"

exports.get = (req, res) ->
  res.jsonp req.post

exports.getList = (req, res) ->
  changePostUrlWithDate(req.posts)
  res.jsonp req.posts

exports.getCount = (req, res) ->
  getCount = (status, callback) ->
    filter = {
      Status: status
    }
    #check user role
    if req.headers["login-user"]
      loginUser = JSON.parse(req.headers["login-user"])
      if loginUser and loginUser.Role isnt "Admin"
        filter.Author = loginUser._id

    Post.count(filter).exec (err, count) ->
      if err
        callback "Get #{status} posts count failed: #{err}"
      else
        callback null, count

  async.parallel
    publishedCount: (callback) ->
      getCount("Published", callback)
    draftCount: (callback) ->
      getCount("Draft", callback)
    trashCount: (callback) ->
      getCount("Trash", callback)
  , (err, results) ->
    if err
      next new Error err
    else
      postCounts = {
        published: results.publishedCount
        draft: results.draftCount
        trash: results.trashCount
        all: results.publishedCount + results.draftCount + results.trashCount
      }
      res.jsonp postCounts


exports.getByUrl = (req, res, next, url) ->
  param =
    Url: url
  if !req.headers["from-admin-console"]
    param.Status = "Published"

  Post.findOne(param)
  .populate('Author', 'UserName')
  .populate('Tags', 'TagName')
  .populate('Category', 'CategoryName')
  .exec (err, post) ->
    if err
      next new Error "Find post(#{url}) failed: #{err}"
    else if !post
      res.statusCode = 404
      res.end()
    else
      if !req.headers["from-admin-console"]
        post.Views++
      post.save (err) ->
        if err
          next new Error "Update post views failed: #{err}"
        else
          req.post = post
          next()

exports.getListByAuthor = (req, res, next, author) ->
  User.findOne({UserName: author}).exec (err, user) ->
    if err
      next new Error "Find user(#{author}) failed: #{err}"
    else if !user
      res.statusCode = 404
      res.end()
    else
      Post.find({Author: user._id, Status: "Published"})
      .populate('Author', 'UserName')
      .populate('Tags', 'TagName')
      .populate('Category', 'CategoryName')
      .sort('-CreateDate')
      .exec (err, posts) ->
        if err
          next new Error "Failed to load posts of author(#{author}): #{err}"
        else
          req.posts = posts
          next()

exports.getListByTag = (req, res, next, tagName) ->
  Tag.find({TagName: tagName})
  .populate("Post")
  .exec (err, tags) ->
    if err
      next new Error "Find tag(#{tagName}) failed: #{err}"
    else if !tags or tags.length is 0
      res.statusCode = 404
      res.end()
    else
      #remove tag whose post is draft
      for t, index in tags
        if t.Post.Status isnt "Published"
          tags.splice(index, 1)
      #populate the field of populated doc
      async.map tags, ((tag, callback) ->
        tag.Post.populate "Author Category Tags", "UserName CategoryName TagName", (err, post) ->
          if err
            callback err
          else
            callback null, post
      ), (err, posts) ->
        if err
          next(err)
        else
          req.posts = posts
          next()

exports.getListByCategory = (req, res, next, categoryName) ->
  Category.findOne({CategoryName: categoryName}).exec (err, category) ->
    if err
      next new Error "Find category(#{categoryName}) failed: #{err}"
    else if !category
      res.statusCode = 404
      res.end()
    else
      Post.find({Category: category._id, Status: "Published"})
      .populate('Author', 'UserName')
      .populate('Tags', 'TagName')
      .populate('Category', 'CategoryName')
      .sort('-CreateDate')
      .exec (err, posts) ->
        if err
          next new Error "Failed to load posts of category(#{categoryName}): #{err}"
        else
          req.posts = posts
          next()

exports.getListByStatus = (req, res, next, status) ->
  filter = {
    Status: status
  }
  #check user role
  if req.headers["login-user"]
    loginUser = JSON.parse(req.headers["login-user"])
    if loginUser and loginUser.Role isnt "Admin"
      filter.Author = loginUser._id

  Post.find(filter)
  .populate('Author', 'UserName')
  .populate('Tags', 'TagName')
  .populate('Category', 'CategoryName')
  .sort('-CreateDate')
  .exec (err, posts) ->
    if err
      next new Error "Failed to load posts of status(#{status}): #{err}"
    else
      req.posts = posts
      next()

exports.list = (req, res, next) ->
  filter = {}
  #check user role
  if req.headers["login-user"]
    loginUser = JSON.parse(req.headers["login-user"])
    if loginUser and loginUser.Role isnt "Admin"
      filter.Author = loginUser._id

  Post.find(filter)
  .populate('Author', 'UserName')
  .populate('Tags', 'TagName')
  .populate('Category', 'CategoryName')
  .sort('-CreateDate')
  .exec (err, posts) ->
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
      next new Error "Save post(#{post._id}) failed: #{err}"
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
                next new Error "Update post(#{post._id}) failed: #{err}"
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