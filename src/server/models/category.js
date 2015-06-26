var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  CategoryName: String,
  Description: String,
  CreateDate: {
    type: Date,
    "default": Date.now
  },
  CreateUser: String,
  EditDate: Date,
  EditUser: String
});

mongoose.model("Category", CategorySchema);
