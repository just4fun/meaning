var user = require("../controllers/user");
var requireAdmin = require("../pipe/requireAdmin");
var requireAdminOrSelf = require("../pipe/requireAdminOrSelf");
var requireUserNameUnique = require("../pipe/requireUserNameUnique");

module.exports = function(app) {
  app.get("/users", requireAdmin(), user.list);
  app.get("/users/:userId", requireAdmin(), user.get);

  app.post("/login", user.login);
  app.post("/users", requireAdmin(), requireUserNameUnique(), user.create);
  app.put("/users/:userId", requireAdminOrSelf(), requireUserNameUnique(), user.update);
  app["delete"]("/users/:userId", requireAdmin(), user["delete"]);

  app.param("userId", user.getById);
};
