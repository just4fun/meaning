post = require "../controllers/post"
requireLogin = require "../pipe/requireLogin"
requireUrlUnique = require "../pipe/requireUrlUnique"
requireAdminOrOwner = require "../pipe/requireAdminOrOwner"

module.exports = (app) ->
  app.get "/posts", requireLogin(), post.list
  #the below /count route must be ahead of /:url route,
  #otherwise /:url route will be fired.
  #what is more, when someone visit /count route in front site or console,
  #there must be redirect to /404 instead of fire /posts/count route.
  app.get "/posts/count", requireLogin(), post.getCount
  app.get "/posts/:url", post.get
  app.get "/posts/author/:author", post.getList
  app.get "/posts/tag/:tag", post.getList
  app.get "/posts/categories/:category", post.getList
  app.get "/posts/list/:status", post.getList

  app.post "/posts", requireLogin(), requireUrlUnique(), post.create
  app.put "/posts/:url", requireAdminOrOwner(), requireUrlUnique(), post.update
  app.delete "/posts/:url", requireAdminOrOwner(), post.delete

  app.param "url", post.getByUrl
  app.param "author", post.getListByAuthor
  app.param "tag", post.getListByTag
  app.param "category", post.getListByCategory
  app.param "status", post.getListByStatus