mongoose = require('mongoose')
Schema = mongoose.Schema

TagSchema = new Schema
  TagName: String
  CreateDate:
    type: Date
    default: Date.now

  Post:
    type: Schema.Types.ObjectId
    ref: 'Post'

mongoose.model 'Tag', TagSchema