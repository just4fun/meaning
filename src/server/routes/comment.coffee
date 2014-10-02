comment = require "../controllers/comment"
requireAdmin = require "../pipe/requireAdmin"

module.exports = (app) ->
  app.get "/comments", comment.list
  app.get "/comments/:commentId", comment.get

  app.get "/comments/query/:query", comment.getList

  app.post "/comments", comment.create
  app.put "/comments/:commentId", requireAdmin(), comment.update
  app.delete "/comments/:commentId", requireAdmin(), comment.delete

  app.param "commentId", comment.getById
  app.param "query", comment.getListByQuery