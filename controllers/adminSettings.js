const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getSettings(req, res) {
  try {
    // Assuming there is only one settings record
    let settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      // create default settings if none exist
      settings = await prisma.adminSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin settings" });
  }
}

async function updateSettings(req, res) {
  const { siteName, maintenanceMode } = req.body;
  try {
    let settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      settings = await prisma.adminSettings.create({ data: {} });
    }
    const updated = await prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        siteName: siteName ?? settings.siteName,
        maintenanceMode: maintenanceMode ?? settings.maintenanceMode,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update admin settings" });
  }
}

module.exports = { getSettings, updateSettings };