mongoose = require('mongoose')
Schema = mongoose.Schema

UserSchema = new Schema
  Username: String
  Email: String
  Password: String
  CreateDate:
    type: Date
    default: Date.now
  EditDate: Date

  Posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]

mongoose.model 'User', UserSchema