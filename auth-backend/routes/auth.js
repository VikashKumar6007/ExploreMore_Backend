const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");// for unique userId + sessionToken

const router = express.Router();

// Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});



// 📌 Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phoneCode, phone, password } = req.body;

    if (!phone || !phoneCode) {
      return res.json({ status: 0, message: "Phone code and number are required" });
    }

    const hashedPass = password ? await bcrypt.hash(password, 10) : ""; 
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

    // Generate IDs + tokens
    const userId = uuidv4();
    const sessionToken = uuidv4();

    const user = new User({
      userId,
      name: name || "",
      email: email || "",
      phoneCode,
      phone,
      password: hashedPass,
      otp,
      isVerified: false,
      createDate: new Date()
    });

    await user.save();

    // ✅ Final response format
    res.json({
      status: 1,
      message: "User created successfully.",
      data: {
        userId: userId,
        sessionToken: sessionToken,
        phoneCode: phoneCode,
        phone: phone,
        otp: otp,  // remove in production if sensitive
        createDate: user.createDate,
        isVerified: 0
      }
    });

  } catch (err) {
    res.json({ status: 0, message: err.message });
  }
});

// 📌 Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // ✅ Use your custom userId field, not MongoDB _id
    const user = await User.findOne({ userId });
    if (!user) return res.json({ status: "error", msg: "User not found" });

    if (user.otp === otp) {
      user.isVerified = true;  // set true after OTP verification
      user.otp = null;         // clear OTP
      await user.save();

      // Generate session token
      const sessionToken = uuidv4();

      res.json({
        status: 1,
        message: "Otp verified successfully",
        data: {
          userId: user.userId,
          sessionToken,
          phoneCode: user.phoneCode,
          phone: user.phone,
          isVerified: 1
        }
      });
    } else {
      res.json({ status: "error", msg: "Invalid OTP" });
    }
  } catch (err) {
    res.json({ status: "error", msg: err.message });
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


// 📌 Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user by your custom userId
    const user = await User.findOne({ userId });
    if (!user) return res.json({ status: "error", msg: "User not found" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    // Generate a new session token
    const sessionToken = uuidv4();

    // Send OTP via email if exists
    if (user.email) {
      await transporter.sendMail({
        to: user.email,
        subject: "Resend OTP",
        text: `Your new OTP is ${otp}`,
      });
    }

    // ✅ Send the same response format
    res.json({
      status: 1,
      message: "OTP resent successfully",
      data: {
        userId: user.userId,
        sessionToken,
        phoneCode: user.phoneCode,
        phone: user.phone,
        otp,              // remove in production if sensitive
        isVerified: user.isVerified ? 1 : 0,
      },
    });
  } catch (err) {
    res.json({ status: "error", msg: err.message });
  }
});






// GET /home
router.get("/home", async (req, res) => {
  try {
    const homeData = {
      status: 1,
      message: "Successfully got Home Management list",
      data: {
        homeManagement: [
          {
            id: 1,
            name: "Banner",
            subtitle: " ",
            type: "B",
            image: "https://example.com/banner.png",
            hideTitle: 0,
            isSeeAll: 0,
            items: [
              {
                id: 3,
                name: "Most Affordable & Fresh!",
                image: "https://example.com/item1.png",
                type: "C",
                typeId: 4,
                hasAddon: 0
              },
              {
                id: 1,
                name: "Summer Fruit Fiesta",
                image: "https://example.com/item2.png",
                type: "C",
                typeId: 1,
                hasAddon: 0
              },
              {
                id: 2,
                name: "Mango that melts Heart",
                image: "https://example.com/item3.png",
                type: "F",
                typeId: 3,
                hasAddon: 0
              }
            ],
            brand: {}
          },
          {
            id: 2,
            name: "Featured Categories",
            subtitle: "Discover Our Top Picks",
            type: "C",
            image: "https://example.com/category.png",
            hideTitle: 0,
            isSeeAll: 1,
            items: [
              {
                id: 1,
                homeManagementId: 2,
                name: "Fresh Fruits",
                icon: "",
                image: "https://example.com/freshfruits.png",
                hasAddon: 0
              },
              {
                id: 3,
                homeManagementId: 2,
                name: "Herbs & Spices",
                icon: "",
                image: "https://example.com/herbs.png",
                hasAddon: 0
              },
              {
                id: 5,
                homeManagementId: 2,
                name: "Fresh Vegetables",
                icon: "",
                image: "https://example.com/vegetables.png",
                hasAddon: 0
              }
            ],
            brand: {}
          },
          {
            id: 3,
            name: "Customise Your Salad",
            subtitle: "Your Bowl. Your Way. Every Day.",
            type: "SLD",
            image: "https://example.com/salad.png",
            hideTitle: 0,
            isSeeAll: 0,
            items: [],
            brand: {}
          },
          {
            id: 4,
            name: "Near Me",
            subtitle: "Restaurants around you",
            type: "NA",
            image: "",
            hideTitle: 0,
            isSeeAll: 1,
            items: [
              {
                id: 101,
                name: "Pizza Hub",
                image: "https://example.com/pizzahub.png",
                type: "R",
                typeId: 101,
                hasAddon: 0
              },
              {
                id: 102,
                name: "Burger House",
                image: "https://example.com/burgerhouse.png",
                type: "R",
                typeId: 102,
                hasAddon: 0
              }
            ],
            brand: {}
          }
        ]
      }
    };

    res.json(homeData);
  } catch (err) {
    res.json({ status: 0, message: err.message });
  }
});

module.exports = router;


module.exports = router;
