const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── GET all favorites for a user ─────────────────────────────
async function getUserFavorites(req, res) {
  const { userId } = req.params;

  try {
    const favorites = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        favoriteSchools: {
          select: { id: true, schoolId: true },
        },
        favoritePrograms: {
          select: { id: true, programId: true },
        },
        favoriteOpenHouses: {
          select: { id: true, openHouseId: true },
        },
      },
    });

    if (!favorites) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
}

// ── ADD favorite ─────────────────────────────
async function addFavorite(req, res) {
  const { userId, type, itemId } = req.body;

  try {
    let favorite;
    switch (type) {
      case "school":
        favorite = await prisma.favoriteSchool.create({
          data: { userId: parseInt(userId), schoolId: itemId },
        });
        break;
      case "program":
        favorite = await prisma.favoriteProgram.create({
          data: { userId: parseInt(userId), programId: itemId },
        });
        break;
      case "openhouse":
        favorite = await prisma.favoriteOpenHouse.create({
          data: { userId: parseInt(userId), openHouseId: itemId },
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid favorite type" });
    }

    res.json(favorite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
}

// ── REMOVE favorite ─────────────────────────────
async function removeFavorite(req, res) {
  const { userId, type, itemId } = req.params;

  try {
    let favorite;
    switch (type) {
      case "school":
        favorite = await prisma.favoriteSchool.delete({
          where: { userId_schoolId: { userId: parseInt(userId), schoolId: itemId } },
        });
        break;
      case "program":
        favorite = await prisma.favoriteProgram.delete({
          where: { userId_programId: { userId: parseInt(userId), programId: itemId } },
        });
        break;
      case "openhouse":
        favorite = await prisma.favoriteOpenHouse.delete({
          where: { userId_openHouseId: { userId: parseInt(userId), openHouseId: itemId } },
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid favorite type" });
    }

    res.json({ message: "Favorite removed", favorite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
}

module.exports = { getUserFavorites, addFavorite, removeFavorite };