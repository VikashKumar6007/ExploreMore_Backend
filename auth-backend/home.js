const express = require("express");
const router = express.Router();

// GET /home
router.get("/", async (req, res) => {
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
              }
            ],
            brand: {}
          },
          {
            id: 3,
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
