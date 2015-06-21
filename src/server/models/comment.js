var CommentSchema, Schema, mongoose;

mongoose = require("mongoose");

Schema = mongoose.Schema;

CommentSchema = new Schema({
  Author: String,
  Email: String,
  Content: String,
  CreateDate: {
    type: Date,
    "default": Date.now
  },
  EditDate: Date,
  EditUser: String,
  Post: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  }
});

mongoose.model("Comment", CommentSchema);
