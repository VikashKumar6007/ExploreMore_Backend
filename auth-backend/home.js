const express = require("express");
const axios = require("axios");
const router = express.Router();

// GET /api/home?lat=28.6139&long=77.2090
router.get("/", async (req, res) => {
  try {
    const { lat, long } = req.query;
    if (!lat || !long) return res.json({ status: 0, message: "Latitude and longitude required" });

    // Famous Places
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=5000&type=tourist_attraction&key=${process.env.GOOGLE_API_KEY}`;
    const placesResponse = await axios.get(placesUrl);
    const nearByPlaces = placesResponse.data.results.map(place => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
      type: "Famous Place",
      lat: place.geometry.location.lat,
      long: place.geometry.location.lng
    }));

    // Popular Foods
    const foodUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=5000&type=restaurant&key=${process.env.GOOGLE_API_KEY}`;
    const foodResponse = await axios.get(foodUrl);
    const favouriteFoods = foodResponse.data.results.map(food => ({
      id: food.place_id,
      name: food.name,
      address: food.vicinity,
      rating: food.rating,
      type: "Food",
      lat: food.geometry.location.lat,
      long: food.geometry.location.lng
    }));

    res.json({
      status: 1,
      message: "Successfully fetched nearby famous places",
      data: { nearByPlaces, favouriteFoods }
    });

  } catch (err) {
    res.json({ status: 0, message: err.message });
  }
});

module.exports = router;
