mongoose = require("mongoose")
md5 = require("MD5")
async = require("async")




module.exports = () ->
  User = mongoose.model("User")
  Post = mongoose.model("Post")

  async.waterfall [

    #init admin user
    (callback) ->
      User.find().exec (err, users) ->
        if err
          callback "Find all users failed: #{err}"
        else if !users or users.length is 0
          user = new User(
            Username: "admin"
            Password: md5("12345")
            Email: "houritsunohikari@gmail.com"
            Posts: []
          )
          user.save (err) ->
            if err
              callback "Init admin failed: #{err}"
            else
              callback null, user

    #init example post
    (user, callback) ->
      console.log "Init admin successfully!"
      Post.find().exec (err, posts) ->
        if err
          callback "Find all posts failed: #{err}"
        else if !posts or posts.length is 0
          post = new Post(
            Title: "example post"
            Url: "just-a-example-post"
            Content: "this is post content."
            Description: "this is post description."
            Status: "Published"
            Author: user._id
          )
          post.save (err) ->
            if err
              callback "Init example post failed: #{err}"
            else
              callback null, user, post

    #update admin user
    (user, post, callback) ->
      console.log "Init example post successfully!"
      user.Posts = user.Posts || []
      user.Posts.push post
      user.save (err) ->
        if err
          callback "Init example post failed: #{err}"
        else
          callback null, user

  ], (err, result) ->
    if err
      new Error err
    else
      console.log "Update admin successfully!"