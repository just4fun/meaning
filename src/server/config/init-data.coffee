mongoose = require("mongoose")
md5 = require("MD5")


module.exports = () ->
  User = mongoose.model("User")
  Post = mongoose.model("Post")

  #init admin
  User.find().exec (err, users) ->
    if !users or users.length is 0
      user = new User({
        Username: "admin"
        Password: md5("12345")
        Email: "houritsunohikari@gmail.com"
        Posts: []
      })
      user.save (err) ->
        if err
          new Error "Init admin failed. #{err}"
        else
          console.log "Init admin successfully!"

          #init other default data
          Post.find().exec (err, posts) ->
            if !posts or posts.length is 0
              post = new Post({
                Title: "example post"
                Url: "just-a-example-post"
                Content: "this is post content."
                Description: "this is post description."
                Author: user._id
              })

              post.save (err) ->
                if err
                  new Error "Init example post failed. #{err}"
                else
                  console.log "Init example post successfully!"
                  user.Posts = user.Posts || []
                  user.Posts.push post
                  user.save (err) ->
                    console.log "Update admin successfully!"