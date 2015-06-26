var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  UserName: String,
  Email: String,
  Password: String,
  Role: {
    type: String,
    "enum": ["Admin", "Author"]
  },
  Token: String,
  LastLoginDate: Date,

  CreateDate: {
    type: Date,
    "default": Date.now
  },
  EditDate: Date,
  EditUser: String
});

mongoose.model("User", UserSchema);
