comment = require "../controllers/comment"
requireLogin = require "../common/requireLogin"
checkAdmin = require "../common/checkAdmin"

module.exports = (app) ->
  app.get "/comments", comment.list
  app.get "/comment/:commentId", comment.get

  app.get "/comments/:query", comment.getList

  app.post "/comment", comment.create
  app.put "/comment/:commentId", requireLogin(), checkAdmin(), comment.update
  app.delete "/comment/:commentId", requireLogin(), checkAdmin(), comment.delete

  app.param "commentId", comment.getById
  app.param "query", comment.getListByQuery