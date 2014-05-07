user = require("../controllers/user")
requireLogin = require("../common/requireLogin")

module.exports = (app) ->
  app.post "/login", user.login
  app.post "/user", requireLogin(), user.create