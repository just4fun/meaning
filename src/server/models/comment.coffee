mongoose = require "mongoose"
Schema = mongoose.Schema

CommentSchema = new Schema
  Author: String
  Email: String
  Content: String

  CreateDate:
    type: Date
    default: Date.now
  EditDate: Date
  EditUser: String


mongoose.model "Comment", CommentSchema