mongoose = require "mongoose"
Token = mongoose.model "Token"

module.exports = ->
  (req, res, next) ->
    token = req.headers["meaning-token"]
    if !token?
      next new Error "User is not logged in."
    else
      Token.findOne
        Token: req.headers["meaning-token"]
      , (err, tok) ->
        if err
          next new Error "Find token failed. #{err}"
        else if !tok
          next new Error "Token is incorrect."
        else
          next()