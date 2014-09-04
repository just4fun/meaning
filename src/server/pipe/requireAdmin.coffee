mongoose = require "mongoose"
User = mongoose.model "User"

module.exports = ->
  (req, res, next) ->
    token = req.headers["meaning-token"]
    if !token?
      next new Error "User is not logged in."
    else
      User.findOne
        Token: token
      , (err, user) ->
        if err
          next new Error "Find user via token(#{token}) failed: #{err}"
        else if !user
          next new Error "Token is incorrect."
        else if user.Role isnt "Admin"
          next new Error "You are not allowed to do this."
        else
          next()