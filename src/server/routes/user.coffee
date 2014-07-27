user = require("../controllers/user")
requireLogin = require("../common/requireLogin")
checkUserNameUnique = require("../common/checkUserNameUnique")

module.exports = (app) ->
  app.get "/users", user.list
  app.get "/user/:userId", user.get

  app.post "/login", user.login
  app.post "/user", requireLogin(), checkUserNameUnique(), user.create
  app.put "/user/:userId", requireLogin(), checkUserNameUnique(), user.update
  app.delete "/user/:userId", requireLogin(), user.delete

  app.param "userId", user.getById