mongoose = require("mongoose")
md5 = require("MD5")
async = require("async")


module.exports = () ->
  User = mongoose.model("User")
  Post = mongoose.model("Post")
  Category = mongoose.model("Category")
  Tag = mongoose.model("Tag")

  ###

  at first, create an example post

  then, run the task of
    1.creating admin user -- × with post(s)
    2.creating an example category -- × with post(s)
    3.creating an example tag with postId
  in parallel

  at last, update the post with authorId && categoryId && tags

  ###

  async.waterfall [

    #at first
    (callback) ->
      Post.find().exec (err, posts) ->
        if err
          callback "Find all posts failed: #{err}"
        else if !posts or posts.length is 0
          console.log "---------------------------"
          console.log "Init example datas start..."
          console.log "---------------------------"
          post = new Post
            Title: "example post"
            Url: "just-an-example-post"
            Content: "this is post content."
            Description: "this is post description."
            Status: "Published"
          post.save (err) ->
            if err
              callback "Create example post failed: #{err}"
            else
              console.log "Create example post successfully!"
              callback null, post

    #then
    (post, callback) ->
      async.parallel

        #create admin user -- × with post(s)
        admin : (callback) ->
          User.find().exec (err, users) ->
            if err
              callback "Find all users failed: #{err}"
            else if !users or users.length is 0
              user = new User
                Username : "admin"
                Password : md5("12345")
                Email : "houritsunohikari@gmail.com"
              #user.Posts = []
              #user.Posts.push post
              user.save (err) ->
                if err
                  callback "Create admin user failed: #{err}"
                else
                  console.log "Create admin user successfully!"
                  callback null, user

        #create an example category -- × with post(s)
        category : (callback) ->
          Category.find().exec (err, categories) ->
            if err
              callback "Find all categories failed: #{err}"
            else if !categories or categories.length is 0
              category = new Category
                CategoryName : "example_category"
                Description : "this is category description."
              #category.Posts = []
              #category.Posts.push post
              category.save (err) ->
                if err
                  callback "Create example category failed: #{err}"
                else
                  console.log "Create example category successfully!"
                  callback null, category

        #create an example tag with postId
        tag : (callback) ->
          Tag.find().exec (err, tags) ->
            if err
              callback "Find all tags failed: #{err}"
            else if !tags or tags.length is 0
              tag = new Tag
                TagName : "example_tag"
                Post : post._id
              tag.save (err) ->
                if err
                  callback "Create example tag failed: #{err}"
                else
                  console.log "Create example tag successfully!"
                  callback null, tag

      , (err, results) ->
        if err
          callback "Init example datas failed: #{err}"
        else
          callback null, post, results

    #at last
    (post, results, callback) ->
      post.Author = results.admin._id
      post.Category = results.category._id
      post.Tags = []
      post.Tags.push results.tag

      post.save (err) ->
        if err
          callback "Update example post failed: #{err}"
        else
          console.log "Update example post successfully!"
          callback null, post

  ], (err, result) ->
    if err
      new Error err
    else
      console.log "---------------------------"
      console.log "Init example datas successfully!"
      console.log "---------------------------"