const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── GET /openhouses ────────────────────────────────────────────
// Public. Returns all active open houses with school name.
// If a valid JWT user is attached (optional auth), also returns
// which ones the user has registered for.

exports.getAll = async (req, res) => {
  try {
    const openHouses = await prisma.openHouse.findMany({
      where: { isActive: true },
      orderBy: { date: "asc" },
      include: {
        school: { select: { name: true, shortName: true } },
        OpenHouseRegistration: { select: { userId: true } },
      },
    });

    const userId = req.userId || null; // set by optional auth middleware

    const data = openHouses.map((oh) => ({
      id:          oh.id,
      title:       oh.title,
      description: oh.description,
      date:        oh.date,
      time:        null, // not in schema yet — included for frontend compat
      location:    oh.location,
      isOnline:    oh.isOnline,
      school:      oh.school?.shortName || oh.school?.name || oh.title,
      registered:  userId
        ? oh.OpenHouseRegistration.some((r) => r.userId === userId)
        : false,
      registrationCount: oh.OpenHouseRegistration.length,
    }));

    res.json(data);
  } catch (err) {
    console.error("[openHouses.getAll]", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── POST /openhouses/:id/register ─────────────────────────────
// Requires auth. Registers the logged-in user for an open house.

exports.register = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const openHouse = await prisma.openHouse.findUnique({ where: { id } });
    if (!openHouse || !openHouse.isActive) {
      return res.status(404).json({ error: "Open house not found" });
    }

    // upsert so duplicate clicks are safe
    await prisma.openHouseRegistration.upsert({
      where:  { userId_openHouseId: { userId, openHouseId: id } },
      update: {}, // already registered — no-op
      create: { userId, openHouseId: id },
    });

    console.log(`[openHouses.register] user ${userId} registered for ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[openHouses.register]", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── DELETE /openhouses/:id/register ───────────────────────────
// Requires auth. Removes the logged-in user's registration.

exports.unregister = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    await prisma.openHouseRegistration.deleteMany({
      where: { userId, openHouseId: id },
    });

    console.log(`[openHouses.unregister] user ${userId} unregistered from ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[openHouses.unregister]", err);
    res.status(500).json({ error: "Server error" });
  }
};