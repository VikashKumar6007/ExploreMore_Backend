// fixIndex.js
const mongoose = require("mongoose");

// 🔹 Replace with your MongoDB connection string
const uri = process.env.MONGO_URI || "mongodb+srv://DB_USER:Vikash12345@cluster0.ubkugif.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function dropIndex() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    // Drop the old non-sparse unique index
    const result = await mongoose.connection.db.collection("users").dropIndex("email_1");
    console.log("🗑️ Dropped index:", result);

    // Recreate correct index
    await mongoose.connection.db.collection("users").createIndex(
      { email: 1 },
      { unique: true, sparse: true }
    );
    console.log("✅ Recreated sparse unique index on email");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

dropIndex();
