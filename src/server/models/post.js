var PostSchema, Schema, mongoose;

mongoose = require("mongoose");

Schema = mongoose.Schema;

PostSchema = new Schema({
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
  Comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

mongoose.model("Post", PostSchema);
