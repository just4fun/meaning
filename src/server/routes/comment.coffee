comment = require "../controllers/comment"
requireAdmin = require "../pipe/requireAdmin"

module.exports = (app) ->
  app.get "/comments", comment.list
  app.get "/comments/guestbook", comment.getFromGuestBook
  app.get "/comments/:commentId", comment.get

  app.get "/posts/:postId/comments", comment.getList

  app.post "/comments", comment.create
  app.put "/comments/:commentId", requireAdmin(), comment.update
  app.delete "/comments/:commentId", requireAdmin(), comment.delete

  app.param "commentId", comment.getById
  app.param "postId", comment.getListByPost