mongoose = require('mongoose')

PostSchema = new mongoose.Schema
  Title: String
  Content: String
  Description: String
  Author: String
  Views:
    type: Number
    default: 0
  CreateDate:
    type: Date
    default: Date.now
  EditDate: Date
  EditUser: String

mongoose.model 'Post', PostSchema