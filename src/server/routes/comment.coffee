comment = require "../controllers/comment"
requireAdmin = require "../pipe/requireAdmin"

module.exports = (app) ->
  app.get "/comments", comment.list
  app.get "/comment/:commentId", comment.get

  app.get "/comments/:query", comment.getList

  app.post "/comment", comment.create
  app.put "/comment/:commentId", requireAdmin(), comment.update
  app.delete "/comment/:commentId", requireAdmin(), comment.delete

  app.param "commentId", comment.getById
  app.param "query", comment.getListByQuery