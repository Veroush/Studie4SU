// prisma/seed.js
// ================================================================
// This file fills your database with real Surinamese schools and
// study programs. Run it once with: npx prisma db seed
// ================================================================

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ================================================================
  // STEP 1 — Create all the schools
  // We save each school in a variable so we can use its ID
  // when creating programs below
  // ================================================================

  const adekus = await prisma.school.upsert({
    where:  { id: "school_adekus" },
    update: {},   // if it already exists, don't change anything
    create: {
      id:        "school_adekus",
      name:      "Anton de Kom Universiteit van Suriname",
      shortName: "AdeKUS",
      type:      "University",
      location:  "Paramaribo",
      website:   "https://www.adekus.edu.sr",
    },
  });
  console.log("✅ Created school: AdeKUS");

  const natin = await prisma.school.upsert({
    where:  { id: "school_natin" },
    update: {},
    create: {
      id:        "school_natin",
      name:      "Natuurtechnisch Instituut",
      shortName: "NATIN",
      type:      "HBO",
      location:  "Paramaribo",
      website:   "https://www.natin.sr",
    },
  });
  console.log("✅ Created school: NATIN");

  const iol = await prisma.school.upsert({
    where:  { id: "school_iol" },
    update: {},
    create: {
      id:        "school_iol",
      name:      "Instituut voor de Opleiding van Leraren",
      shortName: "IOL",
      type:      "HBO",
      location:  "Paramaribo",
    },
  });
  console.log("✅ Created school: IOL");

  const covab = await prisma.school.upsert({
    where:  { id: "school_covab" },
    update: {},
    create: {
      id:        "school_covab",
      name:      "College voor Agrarische en Biologische Wetenschappen",
      shortName: "COVAB",
      type:      "HBO",
      location:  "Paramaribo",
    },
  });
  console.log("✅ Created school: COVAB");

  const imeao = await prisma.school.upsert({
    where:  { id: "school_imeao" },
    update: {},
    create: {
      id:        "school_imeao",
      name:      "Instituut voor Middelbaar Economisch en Administratief Onderwijs",
      shortName: "IMEAO",
      type:      "MBO",
      location:  "Paramaribo",
    },
  });
  console.log("✅ Created school: IMEAO");

  const ptc = await prisma.school.upsert({
    where:  { id: "school_ptc" },
    update: {},
    create: {
      id:        "school_ptc",
      name:      "Polytechnical College Suriname",
      shortName: "PTC",
      type:      "MBO",
      location:  "Paramaribo",
    },
  });
  console.log("✅ Created school: PTC");

  const igsr = await prisma.school.upsert({
    where:  { id: "school_igsr" },
    update: {},
    create: {
      id:        "school_igsr",
      name:      "Instituut voor Geesteswetenschappen Suriname",
      shortName: "IGSR",
      type:      "HBO",
      location:  "Paramaribo",
    },
  });
  console.log("✅ Created school: IGSR");

  // ================================================================
  // STEP 2 — Create all the study programs
  // Each program has:
  //   - a fixed ID that matches clusterToProgramMap in quizRoutes.js
  //   - a cluster tag (TECH, MED, BUS, etc.)
  //   - a link to its school via schoolId
  // ================================================================

  // ── TECHNOLOGY ──────────────────────────────────────────────────
  await prisma.studyProgram.upsert({
    where:  { id: "program_technology" },
    update: {},
    create: {
      id:            "program_technology",
      name:          "ICT / Software Engineering",
      cluster:       "TECH",
      duration:      "4 years",
      levelRequired: "HAVO",
      tuitionCost:   "SRD 4,500 / year",
      description:   "Learn to build software, manage networks, and solve technical problems using modern programming languages and tools.",
      careers:       "Software Developer, Network Administrator, IT Support Specialist, Database Manager, Web Developer",
      schoolId:      natin.id,
    },
  });
  console.log("✅ Created program: ICT / Software Engineering (NATIN)");

  // ── MEDICAL ─────────────────────────────────────────────────────
  await prisma.studyProgram.upsert({
    where:  { id: "program_medical" },
    update: {},
    create: {
      id:            "program_medical",
      name:          "Medicine & Health Sciences",
      cluster:       "MED",
      duration:      "6 years",
      levelRequired: "VWO",
      tuitionCost:   "SRD 6,000 / year",
      description:   "Train to become a medical professional. Covers human biology, clinical skills, diagnostics, and patient care.",
      careers:       "Medical Doctor, Specialist, Surgeon, Public Health Officer, Clinical Researcher",
      schoolId:      adekus.id,
    },
  });
  console.log("✅ Created program: Medicine (AdeKUS)");

  // ── BUSINESS ────────────────────────────────────────────────────
  await prisma.studyProgram.upsert({
    where:  { id: "program_business" },
    update: {},
    create: {
      id:            "program_business",
      name:          "Business Administration & Economics",
      cluster:       "BUS",
      duration:      "4 years",
      levelRequired: "HAVO",
      tuitionCost:   "SRD 4,000 / year",
      description:   "Study how businesses run, how money works, and how to manage teams and organizations effectively.",
      careers:       "Business Manager, Accountant, Financial Analyst, Entrepreneur, Marketing Specialist, Banker",
      schoolId:      adekus.id,
    },
  });
  console.log("✅ Created program: Business Administration (AdeKUS)");

  // ── SOCIAL WORK ─────────────────────────────────────────────────
  await prisma.studyProgram.upsert({
    where:  { id: "program_social_work" },
    update: {},
    create: {
      id:            "program_social_work",
      name:          "Social Work & Community Development",
      cluster:       "SOC",
      duration:      "4 years",
      levelRequired: "HAVO",
      tuitionCost:   "SRD 3,500 / year",
      description:   "Learn how to support individuals, families, and communities through counseling, advocacy, and social programs.",
      careers:       "Social Worker, Community Developer, Youth Counselor, Policy Advisor, NGO Worker, Family Therapist",
      schoolId:      adekus.id,
    },
  });
  console.log("✅ Created program: Social Work (AdeKUS)");

  // ── EDUCATION ───────────────────────────────────────────────────
  await prisma.studyProgram.upsert({
    where:  { id: "program_education" },
    update: {},
    create: {
      id:            "program_education",
      name:          "Teacher Training (Lerarenopleiding)",
      cluster:       "EDU",
      duration:      "4 years",
      levelRequired: "HAVO",
      tuitionCost:   "SRD 3,000 / year",
      description:   "Train to become a teacher at primary or secondary level. Covers pedagogy, child development, and subject specialization.",
      careers:       "Primary School Teacher, Secondary School Teacher, School Counselor, Education Coordinator, Special Needs Teacher",
      schoolId:      iol.id,
    },
  });
  console.log("✅ Created program: Teacher Training (IOL)");

  // ── SCIENCE / AGRICULTURE ───────────────────────────────────────
  await prisma.studyProgram.upsert({
    where:  { id: "program_science" },
    update: {},
    create: {
      id:            "program_science",
      name:          "Agronomy & Natural Sciences",
      cluster:       "SCI",
      duration:      "4 years",
      levelRequired: "HAVO",
      tuitionCost:   "SRD 3,500 / year",
      description:   "Study Suriname's rich natural environment — agriculture, biology, ecology, and food science.",
      careers:       "Agronomist, Biologist, Environmental Officer, Food Inspector, Forest Ranger, Lab Analyst",
      schoolId:      covab.id,
    },
  });
  console.log("✅ Created program: Agronomy & Natural Sciences (COVAB)");

  // ── LAW ─────────────────────────────────────────────────────────
  await prisma.studyProgram.upsert({
    where:  { id: "program_law" },
    update: {},
    create: {
      id:            "program_law",
      name:          "Law & Governance (Rechten)",
      cluster:       "LAW",
      duration:      "4 years",
      levelRequired: "VWO",
      tuitionCost:   "SRD 4,500 / year",
      description:   "Study the Surinamese legal system, international law, governance, and justice. One of the most respected degrees in Suriname.",
      careers:       "Lawyer, Notary, Judge, Civil Servant, Policy Maker, Legal Advisor, Diplomat",
      schoolId:      adekus.id,
    },
  });
  console.log("✅ Created program: Law (AdeKUS)");

  // ================================================================
  // Done!
  // ================================================================
  console.log("\n🎉 Seeding complete! Your database now has:");
  console.log("   • 7 schools");
  console.log("   • 7 study programs (one per career cluster)");
  console.log("\nYou can now run: npx prisma studio");
  console.log("And take the quiz at: http://localhost:3000/quiz.html");
}

// ================================================================
// Run the main function and handle errors
// ================================================================
main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });