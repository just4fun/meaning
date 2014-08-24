mongoose = require "mongoose"
User = mongoose.model "User"
Post = mongoose.model "Post"
Token = mongoose.model "Token"
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
      async.waterfall [

        #create token
        (callback) ->
          token = md5(user.UserName + new Date())
          tokenInfo = new Token
            UserName: user.UserName
            Token: token
            LoginDate: new Date()
          tokenInfo.save (err) ->
            if err
              callback "Create token failed: #{err}"
            else
              callback null, tokenInfo

        #update login time
        (token, callback) ->
          user.LastLoginDate = token.LoginDate
          user.save (err) ->
            if err
              callback "Update LastLoginDate failed: #{err}"
            else
              result = {
                token: token.Token
                user: user
              }
              callback null, result

      ], (err, result) ->
        res.setHeader "meaning-token", result.token

        user = result.user
        user = {
          _id: user._id
          UserName: user.UserName
          Email: user.Email
          Role: user.Role
        }
        res.jsonp user

#-------------------------------------------------------------

exports.get = (req, res) ->
  res.jsonp req.user

exports.getById = (req, res, next, userId) ->
  User.findOne({_id: userId})
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
  User.find()
  .sort("-CreateDate")
  .exec (err, users) ->
    if err
      next new Error "Show user list failed: #{err}"
    else
      res.jsonp users

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