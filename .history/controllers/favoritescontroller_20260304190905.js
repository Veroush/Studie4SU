const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getUserFavorites(req, res) {
  const { userId } = req.params;
  try {
    const favorites = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        favoriteSchools: true,
        favoritePrograms: true,
        favoriteOpenHouses: true,
      },
    });
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
}

async function addFavoriteSchool(req, res) {
  const { userId, schoolId } = req.body;
  try {
    const favorite = await prisma.favoriteSchool.create({
      data: {
        userId: parseInt(userId),
        schoolId: schoolId,
      },
    });
    res.json(favorite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add favorite school" });
  }
}

module.exports = { getUserFavorites, addFavoriteSchool };