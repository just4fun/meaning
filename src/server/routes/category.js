var category, requireAdmin, requireCategoryNameUnique;

category = require("../controllers/category");

requireAdmin = require("../pipe/requireAdmin");

requireCategoryNameUnique = require("../pipe/requireCategoryNameUnique");

module.exports = function(app) {
  app.get("/categories", category.list);
  app.get("/categories/:categoryId", category.get);
  app.post("/categories", requireAdmin(), requireCategoryNameUnique(), category.create);
  app.put("/categories/:categoryId", requireAdmin(), requireCategoryNameUnique(), category.update);
  app["delete"]("/categories/:categoryId", requireAdmin(), category["delete"]);
  return app.param("categoryId", category.getById);
};
