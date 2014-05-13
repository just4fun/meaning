post = require("../controllers/post")
requireLogin = require("../common/requireLogin")

module.exports = (app) ->
  app.get "/posts", post.list
  app.get "/posts/:id", post.get
  app.get "/posts/author/:author", post.getList
  app.post "/posts", requireLogin(), post.create
  app.put "/posts/:id", requireLogin(), post.update

  app.param "id", post.getById
  app.param "author", post.getListByAuthor