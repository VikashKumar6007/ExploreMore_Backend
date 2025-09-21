const express = require("express");
const router = express.Router();
const Place = require("./models/Place");
const Food = require("./models/Food");

// Helper: calculate distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  function deg2rad(deg) { return deg * (Math.PI/180); }
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// GET /api/home?lat=..&long=..
router.get("/", async (req, res) => {
  try {
    const { lat, long } = req.query;
    if (!lat || !long) return res.json({ status: 0, message: "Latitude and longitude are required" });

    const latitude = parseFloat(lat);
    const longitude = parseFloat(long);

    // Fetch all favourite places
    const places = await Place.find({ isFavourite: true });
    const foods = await Food.find({ isFavourite: true });

    // Filter by distance (10km radius)
    const nearbyPlaces = places.filter(p => getDistance(latitude, longitude, p.lat, p.long) <= 10);
    const nearbyFoods = foods.filter(f => getDistance(latitude, longitude, f.lat, f.long) <= 10);

    res.json({
      status: 1,
      message: "Successfully fetched nearby data",
      data: {
        nearByPlaces: nearbyPlaces,
        favouriteFoods: nearbyFoods
      }
    });
  } catch (err) {
    res.json({ status: 0, message: err.message });
  }
});

module.exports = router;
