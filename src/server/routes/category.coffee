category = require "../controllers/category"
requireAdmin = require "../pipe/requireAdmin"
requireCategoryNameUnique = require "../pipe/requireCategoryNameUnique"

module.exports = (app) ->
  app.get "/categories", category.list
  app.get "/category/:categoryId", category.get

  app.post "/category", requireAdmin(), requireCategoryNameUnique(), category.create
  app.put "/category/:categoryId", requireAdmin(), requireCategoryNameUnique(), category.update
  app.delete "/category/:categoryId", requireAdmin(), category.delete

  app.param "categoryId", category.getById