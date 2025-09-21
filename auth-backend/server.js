require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

app.use("/api/auth", require("./routes/auth"));
// Home route
const homeRoutes = require("./home");
app.use("/api/home", homeRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));
