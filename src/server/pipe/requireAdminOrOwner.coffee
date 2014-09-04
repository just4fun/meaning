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
        else if req.post.Author._id.toString() isnt user._id.toString() and user.Role isnt "Admin"
          next new Error "Only admin or owner are allowed to do this."
        else
          next()