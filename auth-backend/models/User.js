const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  otp: String,
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
