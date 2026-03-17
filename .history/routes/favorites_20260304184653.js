const express = require("express");
const router = express.Router();
const { getUserFavorites, addFavoriteSchool } = require("../controllers/favoritesController");

// Get all favorites for a user
router.get("/:userId", getUserFavorites);

// Add a school to favorites
router.post("/school", addFavoriteSchool);

module.exports = router;