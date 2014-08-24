category = require "../controllers/category"
requireLogin = require "../common/requireLogin"
checkCategoryNameUnique = require "../common/checkCategoryNameUnique"

module.exports = (app) ->
  app.get "/categories", category.list
  app.get "/category/:categoryId", category.get

  app.post "/category", requireLogin(), checkCategoryNameUnique(), category.create
  app.put "/category/:categoryId", requireLogin(), checkCategoryNameUnique(), category.update
  app.delete "/category/:categoryId", requireLogin(), category.delete

  app.param "categoryId", category.getById