post = require("../controllers/post")
requireLogin = require("../common/requireLogin")
checkUrlUnique = require("../common/checkUrlUnique")

module.exports = (app) ->
  app.get "/posts", post.list
  app.get "/posts/:url", post.get
  app.get "/posts/author/:author", post.getList
  app.get "/posts/tag/:tag", post.getList
  app.get "/posts/category/:category", post.getList
  app.get "/posts/list/:status", post.getList


  app.post "/posts", requireLogin(), checkUrlUnique(), post.create
  app.put "/posts/:url", requireLogin(), checkUrlUnique(), post.update

  app.param "url", post.getByUrl
  app.param "author", post.getListByAuthor
  app.param "tag", post.getListByTag
  app.param "category", post.getListByCategory
  app.param "status", post.getListByStatus