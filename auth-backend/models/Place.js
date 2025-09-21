const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  long: Number,
  type: { type: String, default: "place" },
  image: String,
  isFavourite: { type: Boolean, default: false }
});

module.exports = mongoose.model("Place", placeSchema);
