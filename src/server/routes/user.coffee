user = require "../controllers/user"
requireAdmin = require "../pipe/requireAdmin"
requireUserNameUnique = require "../pipe/requireUserNameUnique"

module.exports = (app) ->
  app.get "/users", requireAdmin(), user.list
  app.get "/users/:userId", requireAdmin(), user.get

  app.post "/login", user.login
  app.post "/users", requireAdmin(), requireUserNameUnique(), user.create
  app.put "/users/:userId", requireAdmin(), requireUserNameUnique(), user.update
  app.delete "/users/:userId", requireAdmin(), user.delete

  app.param "userId", user.getById