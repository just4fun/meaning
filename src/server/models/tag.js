var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TagSchema = new Schema({
  TagName: String,
  CreateDate: {
    type: Date,
    "default": Date.now
  },

  Post: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  }
});

mongoose.model("Tag", TagSchema);
