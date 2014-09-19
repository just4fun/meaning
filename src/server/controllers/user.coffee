mongoose = require "mongoose"
User = mongoose.model "User"
Post = mongoose.model "Post"
md5 = require "MD5"
_ = require "lodash"
async = require "async"

exports.login = (req, res, next) ->
  User.findOne(
    UserName: req.body.UserName
    Password: md5(req.body.Password)
  ).exec (err, user) ->
    if err
      next new Error "Login failed: #{err}"
    else if !user
      next new Error "UserName or Password is incorrect."
    else
      #update token and last login date
      now = new Date()
      token = md5(user.UserName + now)

      user.Token = token
      user.LastLoginDate = now
      user.save (err) ->
        if err
          next new Error "Update token and last login date failed: #{err}"
        else
          res.setHeader "meaning-token", token
          res.jsonp {
            _id: user._id
            UserName: user.UserName
            Email: user.Email
            Role: user.Role
          }

#-------------------------------------------------------------

exports.get = (req, res) ->
  res.jsonp req.user

exports.getById = (req, res, next, userId) ->
  User.findOne({_id: userId})
  #exclude sensitive fields
  .select("-Password -Token")
  .exec (err, user) ->
    if err
      next new Error "Find user(#{userId}) failed: #{err}"
    else if !user
      res.statusCode = 404
      res.end()
    else
      req.user = user
      next()

exports.list = (req, res, next) ->
  pageIndex = req.param("pageIndex")
  perPage = if pageIndex? then 10 else 9999
  pageIndex = Math.max(0, pageIndex)

  async.parallel
    totalCount: (callback) ->
      User.count().exec (err, count) ->
        if err
          callback "Count users failed: #{err}"
        else
          callback null, count
    list: (callback) ->
      User.find()
      .sort("-CreateDate")
      #exclude sensitive fields
      .select("-Password -Token")
      .skip(pageIndex * perPage)
      .limit(perPage)
      .exec (err, users) ->
        if err
          callback "Show user list failed: #{err}"
        else
          callback null, users
  , (err, results) ->
    if err
      next new Error err
    else
      res.jsonp {
        list: results.list
        totalCount: results.totalCount
      }

exports.create = (req, res, next) ->
  req.body.Password = md5(req.body.Password)
  user = new User(req.body)
  user.save (err) ->
    if err
      next new Error "Create user failed: #{err}"
    else
      res.jsonp user

exports.update = (req, res, next) ->
  oldUser = req.user
  newUser = req.body

  if !newUser.Password
    newUser.Password = oldUser.Password
  else
    newUser.Password = md5(newUser.Password)

  # _.extend({name: 'moe'}, {age: 50});
  # => {name: 'moe', age: 50}
  user = _.extend(oldUser, newUser)
  user.save (err) ->
    if err
      next new Error "Update user(#{user._id}) failed: #{err}"
    else
      res.jsonp user

exports.delete = (req, res, next) ->
  user = req.user

  async.waterfall [
    (callback) ->
      Post.find({Author: user._id})
      .exec (err, posts) ->
        if err
          callback err
        else if posts and posts.length > 0
          callback "There are posts created by this user, please delete these posts first."
        else
          callback null, user
    (user, callback) ->
      User.remove({_id: user._id})
      .exec (err) ->
        if err
          callback err
        else
          callback null

  ], (err, result) ->
    if err
      next new Error err
    else
      res.jsonp "Delete user successfully!"