mongoose = require "mongoose"
User = mongoose.model "User"

module.exports = ->
  (req, res, next) ->
    jsonUser = req.headers["login-user"]
    if jsonUser
      user = JSON.parse(jsonUser)
    if !user?
      next new Error "User is not logged in."
    else if user.Role isnt "Admin"
      next new Error "Only Admin can do this."
    else
      next()