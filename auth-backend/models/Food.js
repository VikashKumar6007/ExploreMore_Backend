const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  long: Number,
  type: { type: String, default: "food" },
  image: String,
  isFavourite: { type: Boolean, default: false }
});

module.exports = mongoose.model("Food", foodSchema);
