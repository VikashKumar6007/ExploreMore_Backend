const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true }, 
  phoneCode: String,
  phone: { type: String, required: true },
  password: String,
  otp: String,
  isVerified: { type: Boolean, default: false }
});


module.exports = mongoose.model("User", userSchema);
