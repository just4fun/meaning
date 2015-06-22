var fs = require("fs");
var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose");
var config = require("./config");

module.exports = function(appPath) {
  // register mongoose models
  var models_path = appPath + "/models";
  fs.readdirSync(models_path).forEach(function(file) {
    var newPath = models_path + "/" + file;
    require(newPath);
  });

  // init express
  var corsOption = {
    exposedHeaders: ["meaning-token", "login-user"]
  };
  var app = express();
  app.configure(function() {
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.methodOverride());
    app.use(cors(corsOption));
    app.use(app.router);
    app.use(function(err, req, res, next) {
      res.statusCode = 500;
      res.json({
        Message: err.message,
        Stack: config.debug ? err.stack : void 0
      });
      res.end();
    });
  });

  // register express routes
  var routes_path = appPath + "/routes";
  fs.readdirSync(routes_path).forEach(function(file) {
    var newPath = routes_path + "/" + file;
    require(newPath)(app);
  });

  return app;
};
