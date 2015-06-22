var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  Title: String,
  Url: String,
  Content: String,
  Description: String,
  Views: {
    type: Number,
    "default": 0
  },
  Status: {
    type: String,
    "enum": ["Published", "Draft", "Trash"]
  },
  AllowComments: {
    type: Boolean,
    "default": true
  },

  CreateDate: {
    type: Date,
    "default": Date.now
  },
  EditDate: Date,
  EditUser: String,

  Author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  Category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  Tags: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tag"
    }
  ],

  /**
   * why this field isnt embedded document?
   * because in admin console, the comments maintenance will support pagination,
   * and the embedded document can't achieve that.
   */
  Comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

mongoose.model("Post", PostSchema);
