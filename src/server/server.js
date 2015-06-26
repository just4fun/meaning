var config = require("./config/config");
var initApp = require("./config/init-app");
var initData = require("./config/init-data");
var mongoose = require("mongoose");

var app = initApp(__dirname);

mongoose.connect(config.mongodbAddress);
initData();

var port = config.defaultPort || 9527;
app.listen(port, function() {
  console.log("Listening on port " + port);
});
