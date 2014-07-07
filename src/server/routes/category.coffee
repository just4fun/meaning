category = require("../controllers/category")
requireLogin = require("../common/requireLogin")
checkCategoryNameUnique = require("../common/checkCategoryNameUnique")

module.exports = (app) ->
  app.get "/categories", category.list
  app.get "/category/:id", category.get
  app.post "/category", requireLogin(), checkCategoryNameUnique(), category.create
  app.put "/category/:id", requireLogin(), checkCategoryNameUnique(), category.update
  app.delete "/category/:id", requireLogin(), category.delete

  app.param "id", category.getById