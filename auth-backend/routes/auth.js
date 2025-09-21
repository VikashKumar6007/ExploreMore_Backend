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
    const { name, email, phone, password } = req.body;

    if (!phone) {
      return res.json({ status: "error", msg: "Phone number is required" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const user = new User({
      name,
      email: email || null, // optional
      phone,
      password: hashedPass,
      otp: email ? otp : null, // generate OTP only if email exists
      isVerified: email ? false : true, // skip verification if phone-only
    });

    await user.save();

    // Send OTP only if email is provided
    if (email) {
      await transporter.sendMail({
        to: email,
        subject: "Verify your account",
        text: `Your OTP is ${otp}`,
      });
      res.json({ status: "success", userId: user._id, msg: "OTP sent to email" });
    } else {
      res.json({ status: "success", userId: user._id, msg: "Registered successfully with phone" });
    }
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
    user.isVerified = true;
    user.otp = null;
    await user.save();
    res.json({ status: "verified" });
  } else {
    res.json({ status: "error", msg: "Invalid OTP" });
  }
});

// 📌 Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ status: "error", msg: "User not found" });

  const isPassValid = await bcrypt.compare(password, user.password);
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
