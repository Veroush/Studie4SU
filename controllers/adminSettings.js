// Raksha's file
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULTS = {
  language: { available: ["dutch", "english"], default: "dutch" },
  platform: { name: "Studiekeuzegids Suriname", contactEmail: "", supportEmail: "", tagline: "" },
  features: { enableFavorites: true, enableComparison: true, enableQuiz: true, enableOpenHouse: true },
  notifications: { email: false, dailySummary: false },
  data: { retentionPeriod: "90" },

  // Added: about page content — hero paragraphs and team members
  // Images are filenames only, resolved to /img/<filename> on the frontend
  aboutUs: {
    hero: {
      p1: "Het kiezen van de juiste school of studierichting kan verwarrend zijn. Informatie is vaak verspreid over verschillende websites, social-mediapagina's of is simpelweg moeilijk te vinden. Als studenten hebben wij zelf ervaren hoe lastig het kan zijn om een duidelijk overzicht te krijgen van de opleidingsmogelijkheden in Suriname.",
      p2: "Daarom hebben wij Studie4SU ontwikkeld — een platform dat het verkennen van scholen en studierichtingen eenvoudiger maakt. Onze website brengt informatie samen op één plek, waardoor studenten gemakkelijk scholen in Suriname kunnen zoeken, hun opties kunnen bekijken en zelfs een studiekeuzequiz kunnen doen om te ontdekken welke richting het beste bij hen past.",
      p3: "Wat begon als een schoolproject groeide al snel uit tot een gezamenlijk doel: iets bouwen dat echt nuttig kan zijn voor toekomstige studenten. Door design, ontwikkeling en databasebeheer te combineren, hebben wij samen een platform gecreëerd dat studenten helpt beter geïnformeerde keuzes te maken over hun opleiding.",
      p4: "Studie4SU is niet zomaar een website — het is onze manier om studenten te helpen de eerste stap richting hun toekomst te zetten."
    },
    team: [
      {
        name: "Valentino Amatsaleh",
        role: "UI Designer • Animator • Frontend Developer",
        image: "Valentino.svg",
        bio: "Valentino was verantwoordelijk voor het ontwerpen van de visuele ervaring van de website. Hij ontwikkelde de gebruikersinterface, animaties en interactieve elementen die het platform aantrekkelijk en gebruiksvriendelijk maken. Door te focussen op gebruiksgemak en een modern ontwerp zorgde hij ervoor dat studenten soepel door de website kunnen navigeren en eenvoudig de beschikbare scholen en studierichtingen kunnen ontdekken."
      },
      {
        name: "Veroushka Ramjiawan",
        role: "Backend Developer • Frontend Developer",
        image: "Veroushka.svg",
        bio: "Veroushka werkte aan de kernfunctionaliteiten van de website. Door zowel backend- als frontend-onderdelen te ontwikkelen, hielp zij de gebruikersinterface te verbinden met het systeem achter de website. Haar werk zorgt ervoor dat zoekfuncties, quizzes en andere onderdelen soepel werken en de juiste informatie aan gebruikers tonen."
      },
      {
        name: "Raksha Doerga",
        role: "Database Designer • Backend Developer",
        image: "Raksha.svg",
        bio: "Raksha ontwierp en structureerde de database die het platform aandrijft. Hij verzamelde en organiseerde informatie over verschillende scholen en studierichtingen, zodat deze efficiënt kan worden doorzocht en weergegeven. Dankzij zijn werk kunnen gebruikers snel en gemakkelijk betrouwbare informatie vinden over onderwijsopties in Suriname."
      },
      {
        name: "Amerie Gardt",
        role: "Project Manager",
        image: "Amerie.svg",
        bio: "Amerie speelde een belangrijke rol in het organiseren en begeleiden van de ontwikkeling van het project. Als projectmanager was zij verantwoordelijk voor het plannen van taken, het opstellen van doelen en het ervoor zorgen dat het team gedurende het ontwikkelingsproces op schema bleef. Door de workflow te coördineren en de voortgang te bewaken, zorgde zij ervoor dat elk onderdeel van het project op tijd werd afgerond en dat het team efficiënt naar het eindresultaat toewerkte."
      }
    ]
  }
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
  // Added aboutUs to destructure so it can be updated via PUT /admin/settings
  const { language, platform, features, notifications, data, aboutUs } = req.body;
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
        ...(aboutUs       && { aboutUs }),
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update admin settings" });
  }
}

module.exports = { getSettings, updateSettings };