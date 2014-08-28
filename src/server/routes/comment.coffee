comment = require "../controllers/comment"
requireLogin = require "../common/requireLogin"

module.exports = (app) ->
  app.get "/comments", comment.list
  app.get "/comment/:commentId", comment.get

  app.post "/comment", comment.create
  app.put "/comment/:commentId", requireLogin(), comment.update
  app.delete "/comment/:commentId", requireLogin(), comment.delete

  app.param "commentId", comment.getById