mongoose = require('mongoose')
Schema = mongoose.Schema

CategorySchema = new Schema
  CategoryName: String
  Description: String
  CreateDate:
    type: Date
    default: Date.now
  CreateUser: String
  EditDate: Date
  EditUser: String

  Posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]


mongoose.model 'Category', CategorySchema