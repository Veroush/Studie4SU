const express = require("express");
const router = express.Router();
const { getUserFavorites, addFavorite, removeFavorite } = require("../controllers/favoritescontroller");

// GET all favorites for a user
router.get("/:userId", getUserFavorites);

// POST add favorite (body: { userId, type: 'school'|'program'|'openhouse', itemId })
router.post("/", addFavorite);

// DELETE remove favorite (params: /:type/:userId/:itemId)
router.delete("/:type/:userId/:itemId", removeFavorite);

module.exports = router;