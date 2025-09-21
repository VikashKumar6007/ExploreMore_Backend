const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
// // 📌 Register
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;
//     const hashedPass = await bcrypt.hash(password, 10);
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();

//     const user = new User({ name, email, phone, password: hashedPass, otp });
//     await user.save();

//     // Send OTP
//     await transporter.sendMail({
//       to: email,
//       subject: "Verify your account",
//       text: `Your OTP is ${otp}`,
//     });

//     res.json({ status: "success", userId: user._id, msg: "OTP sent" });
//   } catch (err) {
//     res.json({ status: "error", msg: err.message });
//   }
// });



// 📌 Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phoneCode, phone, password } = req.body;

    if (!phone || !phoneCode) {
      return res.json({ status: "error", msg: "Phone code and number are required" });
    }

    const hashedPass = password ? await bcrypt.hash(password, 10) : ""; 
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const user = new User({
      name: name || "",
      email: email || "",
      phoneCode,
      phone,
      password: hashedPass,
      otp,
      isVerified: false // all users start unverified
    });

    await user.save();

    // send OTP via email if email exists
    if (email) {
      await transporter.sendMail({
        to: email,
        subject: "Verify your account",
        text: `Your OTP is ${otp}`
      });
    }

    // Here you can also send OTP via SMS if phone-only (using Twilio or another service)
    res.json({ status: "success", userId: user._id, msg: "OTP sent" });

  } catch (err) {
    res.json({ status: "error", msg: err.message });
  }
});

// 📌 Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.json({ status: "error", msg: "User not found" });

  if (user.otp === otp) {
    user.isVerified = true;  // ✅ set true after OTP verification
    user.otp = null;         // clear OTP
    await user.save();
    res.json({ status: "verified", msg: "OTP verified successfully" });
  } else {
    res.json({ status: "error", msg: "Invalid OTP" });
  }
});


// 📌 Login
router.post("/login", async (req, res) => {
  const { email, phoneCode, phone, password } = req.body;

  // allow login with either email or phone
  const user = email 
    ? await User.findOne({ email }) 
    : await User.findOne({ phoneCode, phone });

  if (!user) return res.json({ status: "error", msg: "User not found" });

  const isPassValid = password ? await bcrypt.compare(password, user.password) : true;
  if (!isPassValid) return res.json({ status: "error", msg: "Wrong password" });

  if (!user.isVerified) return res.json({ status: "error", msg: "Not verified" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ status: "success", token });
});


// 📌 Forgot Password (send OTP)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ status: "error", msg: "User not found" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  user.otp = otp;
  await user.save();

  await transporter.sendMail({
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP is ${otp}`,
  });

  res.json({ status: "success", msg: "OTP sent" });
});

// 📌 Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ status: "error", msg: "User not found" });

  if (user.otp === otp) {
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    await user.save();
    res.json({ status: "success", msg: "Password reset successful" });
  } else {
    res.json({ status: "error", msg: "Invalid OTP" });
  }
});

module.exports = router;
