mongoose = require "mongoose"
Post = mongoose.model "Post"

module.exports = ->
  (req, res, next) ->
    if !req.body.Url
      return next new Error "No url."
    Post.find().exec (err, posts) ->
      if err
        next new Error "Show post list failed. #{err}"
      else if posts && posts.length > 0
        #Update
        if req.post
          for post in posts
            if post.Url is req.body.Url and post._id isnt req.body._id
              next new Error "This url is already exists."
              return
          #Create
        else
          for post in posts
            if post.Url is req.body.Url
              next new Error "This url is already exists."
              return
        next()
      else
        next()