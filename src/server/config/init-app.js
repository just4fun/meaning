var config, cors, express, fs, mongoose;

fs = require("fs");

express = require("express");

cors = require("cors");

mongoose = require("mongoose");

config = require("./config");

module.exports = function(appPath) {
  var app, corsOption, models_path, routes_path;
  models_path = appPath + "/models";
  fs.readdirSync(models_path).forEach(function(file) {
    var newPath;
    newPath = models_path + "/" + file;
    return require(newPath);
  });
  corsOption = {
    exposedHeaders: ["meaning-token", "login-user"]
  };
  app = express();
  app.configure(function() {
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.methodOverride());
    app.use(cors(corsOption));
    app.use(app.router);
    return app.use(function(err, req, res, next) {
      res.statusCode = 500;
      res.json({
        Message: err.message,
        Stack: config.debug ? err.stack : void 0
      });
      return res.end();
    });
  });
  routes_path = appPath + "/routes";
  fs.readdirSync(routes_path).forEach(function(file) {
    var newPath;
    newPath = routes_path + "/" + file;
    return require(newPath)(app);
  });
  return app;
};
