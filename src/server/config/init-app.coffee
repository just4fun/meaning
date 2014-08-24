fs = require "fs"
express = require "express"
cors = require "cors"
mongoose = require "mongoose"
config = require "./config"


module.exports = (appPath)->
  #register mongoose models
  models_path = appPath + "/models"
  fs.readdirSync(models_path).forEach (file) ->
    newPath = models_path + "/" + file
    require(newPath)

  #init express
  corsOption =
    exposedHeaders: [
      "meaning-token"
      "login-user"
    ]
  app = express()
  app.configure ->
    app.use express.urlencoded()
    app.use express.json()
    app.use express.methodOverride()
    app.use cors(corsOption)
    app.use app.router
    app.use (err, req, res, next)->
      res.statusCode = 500
      res.json
        Message: err.message
        Stack: err.stack if config.debug
      res.end()

  #register express routes
  routes_path = appPath + "/routes"
  fs.readdirSync(routes_path).forEach (file) ->
    newPath = routes_path + "/" + file
    require(newPath)(app)

  app