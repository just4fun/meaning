user = require "../controllers/user"
requireAdmin = require "../pipe/requireAdmin"
requireUserNameUnique = require "../pipe/requireUserNameUnique"

module.exports = (app) ->
  app.get "/users", requireAdmin(), user.list
  app.get "/user/:userId", requireAdmin(), user.get

  app.post "/login", user.login
  app.post "/user", requireAdmin(), requireUserNameUnique(), user.create
  app.put "/user/:userId", requireAdmin(), requireUserNameUnique(), user.update
  app.delete "/user/:userId", requireAdmin(), user.delete

  app.param "userId", user.getById