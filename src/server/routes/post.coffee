post = require("../controllers/post")
requireLogin = require("../common/requireLogin")
checkUrlUnique = require("../common/checkUrlUnique")

module.exports = (app) ->
  app.get "/posts", post.list
  #the below /count route must be ahead of /:url route,
  #otherwise /:url route will be fired.
  #what is more, when someone visit /count route in front site or console,
  #there must be redirect to /404 instead of fire /posts/count route.
  app.get "/posts/count", post.getCount
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