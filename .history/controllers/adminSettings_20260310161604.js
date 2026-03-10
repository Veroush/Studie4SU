const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULTS = {
  language: { available: ["dutch", "english"], default: "dutch" },
  platform: { name: "Studiekeuzegids Suriname", contactEmail: "", supportEmail: "", tagline: "" },
  features: { enableFavorites: true, enableComparison: true, enableQuiz: true, enableOpenHouse: true },
  notifications: { email: false, dailySummary: false },
  data: { retentionPeriod: "90" }
};

async function getOrCreate() {
  let settings = await prisma.adminSettings.findFirst();
  if (!settings) {
    settings = await prisma.adminSettings.create({ data: DEFAULTS });
  }
  return settings;
}

async function getSettings(req, res) {
  try {
    const settings = await getOrCreate();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin settings" });
  }
}

async function updateSettings(req, res) {
  const { language, platform, features, notifications, data } = req.body;
  try {
    const settings = await getOrCreate();
    const updated = await prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        ...(language      && { language }),
        ...(platform      && { platform }),
        ...(features      && { features }),
        ...(notifications && { notifications }),
        ...(data          && { data }),
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update admin settings" });
  }
}

module.exports = { getSettings, updateSettings };