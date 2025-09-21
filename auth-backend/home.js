const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { lat, long } = req.query;

    if (!lat || !long) {
      return res.json({ status: 0, message: "Latitude and longitude are required" });
    }

    // Google Places API URL
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=5000&type=tourist_attraction&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    // Fetch data
    const response = await axios.get(url);
    const places = response.data.results.map((place, index) => ({
      id: index + 1,
      name: place.name,
      lat: place.geometry.location.lat,
      long: place.geometry.location.lng,
      rating: place.rating || 0,
      type: place.types[0] || "tourist_attraction",
      address: place.vicinity || ""
    }));

    // Return in your app format
    res.json({
      status: 1,
      message: "Successfully fetched nearby famous places",
      data: {
        nearByPlaces: places,
        favouriteFoods: [] // You can add your food logic here later
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ status: 0, message: "Failed to fetch data", error: err.message });
  }
});

module.exports = router;
