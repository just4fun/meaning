mongoose = require "mongoose"
User = mongoose.model "User"
Token = mongoose.model "Token"
md5 = require "MD5"

exports.login = (req, res, next) ->
  User.findOne(
    Username: req.body.Username
    Password: md5(req.body.Password)
  ).select("_id Username Email").exec (err, user) ->
    if err
      next new Error "Login failed. #{err}"
    else if !user
      next new Error "Username or Password is incorrect."
    else
      #create token
      token = md5(user.Username + new Date())
      tokenInfo = new Token({
        Username: user.Username
        Token: token
        LoginDate: new Date()
      })
      tokenInfo.save (err) ->
        if err
          next new Error "Create token failed. #{err}"
      res.setHeader "meaning-token", token
      res.jsonp user

exports.create = (req, res) ->
  req.body.Password = md5(req.body.Password)
  user = new User(req.body)
  user.save (err) ->
    if err
      next new Error "Create user failed. #{err}"
    else
      res.jsonp user