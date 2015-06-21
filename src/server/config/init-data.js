var async, md5, mongoose;

mongoose = require("mongoose");

md5 = require("MD5");

async = require("async");

module.exports = function() {
  var Category, Post, Tag, User;
  User = mongoose.model("User");
  Post = mongoose.model("Post");
  Category = mongoose.model("Category");
  Tag = mongoose.model("Tag");
  /*
  
  at first, create an example post
  
  then, run the task of
    1.creating admin user -- × with post(s)
    2.creating an example category -- × with post(s)
    3.creating an example tag with postId
  in parallel
  
  at last, update the post with authorId && categoryId && tags
  */

  return async.waterfall([
    function(callback) {
      return Post.find().exec(function(err, posts) {
        var post;
        if (err) {
          return callback("Find all posts failed: " + err);
        } else if (!posts || posts.length === 0) {
          console.log("---------------------------");
          console.log("Init example datas start...");
          console.log("---------------------------");
          post = new Post({
            Title: "example post",
            Url: "just-an-example-post",
            Content: "this is post content.",
            Description: "this is post description.",
            Status: "Published"
          });
          return post.save(function(err) {
            if (err) {
              return callback("Create example post failed: " + err);
            } else {
              console.log("Create example post successfully!");
              return callback(null, post);
            }
          });
        }
      });
    }, function(post, callback) {
      return async.parallel({
        admin: function(callback) {
          return User.find().exec(function(err, users) {
            var user;
            if (err) {
              return callback("Find all users failed: " + err);
            } else if (!users || users.length === 0) {
              user = new User({
                UserName: "admin",
                Password: md5("12345"),
                Email: "houritsunohikari@gmail.com",
                Role: "Admin"
              });
              return user.save(function(err) {
                if (err) {
                  return callback("Create admin user failed: " + err);
                } else {
                  console.log("Create admin user successfully!");
                  return callback(null, user);
                }
              });
            }
          });
        },
        category: function(callback) {
          return Category.find().exec(function(err, categories) {
            var category;
            if (err) {
              return callback("Find all categories failed: " + err);
            } else if (!categories || categories.length === 0) {
              category = new Category({
                CategoryName: "example_category",
                Description: "this is category description."
              });
              return category.save(function(err) {
                if (err) {
                  return callback("Create example category failed: " + err);
                } else {
                  console.log("Create example category successfully!");
                  return callback(null, category);
                }
              });
            }
          });
        },
        tag: function(callback) {
          return Tag.find().exec(function(err, tags) {
            var tag;
            if (err) {
              return callback("Find all tags failed: " + err);
            } else if (!tags || tags.length === 0) {
              tag = new Tag({
                TagName: "tag1",
                Post: post._id
              });
              return tag.save(function(err) {
                if (err) {
                  return callback("Create example tag failed: " + err);
                } else {
                  console.log("Create example tag successfully!");
                  return callback(null, tag);
                }
              });
            }
          });
        }
      }, function(err, results) {
        if (err) {
          return callback("Init example datas failed: " + err);
        } else {
          return callback(null, post, results);
        }
      });
    }, function(post, results, callback) {
      post.Author = results.admin._id;
      post.Category = results.category._id;
      post.Tags = [];
      post.Tags.push(results.tag);
      return post.save(function(err) {
        if (err) {
          return callback("Update example post failed: " + err);
        } else {
          console.log("Update example post successfully!");
          return callback(null, post);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      return new Error(err);
    } else {
      console.log("---------------------------");
      console.log("Init example datas successfully!");
      return console.log("---------------------------");
    }
  });
};
