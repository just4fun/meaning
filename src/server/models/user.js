var Schema, UserSchema, mongoose;

mongoose = require("mongoose");

Schema = mongoose.Schema;

UserSchema = new Schema({
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
