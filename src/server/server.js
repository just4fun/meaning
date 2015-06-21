var app, config, initApp, initData, mongoose, port;

config = require("./config/config");

initApp = require("./config/init-app");

initData = require("./config/init-data");

mongoose = require("mongoose");

app = initApp(__dirname);

mongoose.connect(config.mongodbAddress);

initData();

port = config.defaultPort || 9527;

app.listen(port, function() {
  return console.log("Listening on port " + port);
});
