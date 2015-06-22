var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  Author: String,
  Email: String,
  Content: String,

  CreateDate: {
    type: Date,
    "default": Date.now
  },
  EditDate: Date,
  EditUser: String,

  /**
   * if comment has "Post" field, it's related to a Post;
   * otherwith it's related to Guestbook.
   */
  Post: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  }
});

mongoose.model("Comment", CommentSchema);
