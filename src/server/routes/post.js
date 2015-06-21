var post, requireAdminOrOwner, requireLogin, requireUrlUnique;

post = require("../controllers/post");

requireLogin = require("../pipe/requireLogin");

requireUrlUnique = require("../pipe/requireUrlUnique");

requireAdminOrOwner = require("../pipe/requireAdminOrOwner");

module.exports = function(app) {
  app.get("/posts", requireLogin(), post.list);
  app.get("/posts/count", requireLogin(), post.getCount);
  app.get("/posts/:url", post.get);
  app.get("/posts/author/:author", post.getList);
  app.get("/posts/tag/:tag", post.getList);
  app.get("/posts/categories/:category", post.getList);
  app.get("/posts/list/:status", post.getList);
  app.post("/posts", requireLogin(), requireUrlUnique(), post.create);
  app.put("/posts/:url", requireAdminOrOwner(), requireUrlUnique(), post.update);
  app["delete"]("/posts/:url", requireAdminOrOwner(), post["delete"]);
  app.param("url", post.getByUrl);
  app.param("author", post.getListByAuthor);
  app.param("tag", post.getListByTag);
  app.param("category", post.getListByCategory);
  return app.param("status", post.getListByStatus);
};
