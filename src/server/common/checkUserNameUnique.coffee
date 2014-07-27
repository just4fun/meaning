mongoose = require "mongoose"
User = mongoose.model "User"

module.exports = ->
  (req, res, next) ->
    if !req.body.UserName
      return next new Error "No user name."
    User.find().exec (err, users) ->
      if err
        next new Error "Show user list failed. #{err}"
      else if users && users.length > 0
        #Update
        if req.user
          for user in users
            if user.UserName is req.body.UserName and user._id.toString() isnt req.body._id
              next new Error "This name is already exists."
              return
        #Create
        else
          for user in users
            if user.UserName is req.body.UserName
              next new Error "This name is already exists."
              return
        next()
      else
        next()