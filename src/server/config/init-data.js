var mongoose = require("mongoose");
var md5 = require("MD5");
var async = require("async");

module.exports = function() {
  var User = mongoose.model("User");
  var Post = mongoose.model("Post");
  var Category = mongoose.model("Category");
  var Tag = mongoose.model("Tag");

  /**
   * at first, create an example post
   *
   * then, run the task of
   *   1.creating admin user -- × with post(s)
   *   2.creating an example category -- × with post(s)
   *   3.creating an example tag with postId
   * in parallel
   *
   * at last, update the post with authorId && categoryId && tags
   */

  async.waterfall([

    // at first
    function(callback) {
      Post.find().exec(function(err, posts) {
        if (err) {
          callback("Find all posts failed: " + err);
        } else if (!posts || posts.length === 0) {
          console.log("---------------------------");
          console.log("Init example datas start...");
          console.log("---------------------------");
          var post = new Post({
            Title: "example post",
            Url: "just-an-example-post",
            Content: "this is post content.",
            Description: "this is post description.",
            Status: "Published"
          });
          post.save(function(err) {
            if (err) {
              callback("Create example post failed: " + err);
            } else {
              console.log("Create example post successfully!");
              callback(null, post);
            }
          });
        }
      });
    },

    // then
    function(post, callback) {
      async.parallel({

        // create admin user -- × with post(s)
        admin: function(callback) {
          User.find().exec(function(err, users) {
            if (err) {
              callback("Find all users failed: " + err);
            } else if (!users || users.length === 0) {
              var user = new User({
                UserName: "admin",
                Password: md5("12345"),
                Email: "houritsunohikari@gmail.com",
                Role: "Admin"
              });
              //user.Posts = [];
              //user.Posts.push(post);
              user.save(function(err) {
                if (err) {
                  callback("Create admin user failed: " + err);
                } else {
                  console.log("Create admin user successfully!");
                  callback(null, user);
                }
              });
            }
          });
        },

        // create an example category -- × with post(s)
        category: function(callback) {
          Category.find().exec(function(err, categories) {
            if (err) {
              callback("Find all categories failed: " + err);
            } else if (!categories || categories.length === 0) {
              var category = new Category({
                CategoryName: "example_category",
                Description: "this is category description."
              });
              //category.Posts = [];
              //category.Posts.push(post);
              category.save(function(err) {
                if (err) {
                  callback("Create example category failed: " + err);
                } else {
                  console.log("Create example category successfully!");
                  callback(null, category);
                }
              });
            }
          });
        },

        // create an example tag with postId
        tag: function(callback) {
          Tag.find().exec(function(err, tags) {
            if (err) {
              callback("Find all tags failed: " + err);
            } else if (!tags || tags.length === 0) {
              var tag = new Tag({
                TagName: "tag1",
                Post: post._id
              });
              tag.save(function(err) {
                if (err) {
                  callback("Create example tag failed: " + err);
                } else {
                  console.log("Create example tag successfully!");
                  callback(null, tag);
                }
              });
            }
          });
        }
      }, function(err, results) {
        if (err) {
          callback("Init example datas failed: " + err);
        } else {
          callback(null, post, results);
        }
      });
    },

    // at last
    function(post, results, callback) {
      post.Author = results.admin._id;
      post.Category = results.category._id;
      post.Tags = [];
      post.Tags.push(results.tag);
      post.save(function(err) {
        if (err) {
          callback("Update example post failed: " + err);
        } else {
          console.log("Update example post successfully!");
          callback(null, post);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      new Error(err);
    } else {
      console.log("---------------------------");
      console.log("Init example datas successfully!");
      console.log("---------------------------");
    }
  });
};
