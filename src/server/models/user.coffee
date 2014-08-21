mongoose = require('mongoose')
Schema = mongoose.Schema

UserSchema = new Schema
  UserName: String
  Email: String
  Password: String
  Role:
    type: String
    enum: ["Admin", "Author"]
  CreateDate:
    type: Date
    default: Date.now
  EditDate: Date
  EditUser: String
  LastLoginDate: Date

mongoose.model 'User', UserSchema