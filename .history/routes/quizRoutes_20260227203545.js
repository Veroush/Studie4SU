// routes/quizRoutes.js
// Quiz submission routes for Studie4SU
// Handles two endpoints:
//   POST /api/quiz/submit         ← OLD cluster-based format (kept for backwards compatibility)
//   POST /api/quiz/submit-profile ← NEW profile-based format from the updated quiz page

const express    = require('express');
const router     = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma     = new PrismaClient();

/* =============================================================
   HELPER: cluster weights for the OLD quiz format
============================================================= */
const answerWeights = {
  // These are from the original 10-question cluster quiz.
  // Kept here so the old format still works if needed.
  q1_a: { TECH: 3, MED: 0, BUS: 0, SOC: 0, EDU: 0, SCI: 1, LAW: 0 },
  q1_b: { TECH: 0, MED: 3, BUS: 0, SOC: 1, EDU: 0, SCI: 1, LAW: 0 },
  q1_c: { TECH: 0, MED: 0, BUS: 3, SOC: 0, EDU: 0, SCI: 0, LAW: 1 },
  q1_d: { TECH: 0, MED: 0, BUS: 0, SOC: 3, EDU: 1, SCI: 0, LAW: 0 },
  q1_e: { TECH: 0, MED: 0, BUS: 0, SOC: 0, EDU: 3, SCI: 0, LAW: 0 },
  q1_f: { TECH: 0, MED: 0, BUS: 0, SOC: 0, EDU: 0, SCI: 3, LAW: 0 },
  q1_g: { TECH: 0, MED: 0, BUS: 1, SOC: 0, EDU: 0, SCI: 0, LAW: 3 },
};

// Maps winning cluster → program ID that exists in the database
const clusterToProgramMap = {
  TECH: 'program_technology',
  MED:  'program_medical',
  BUS:  'program_business',
  SOC:  'program_social_work',
  EDU:  'program_education',
  SCI:  'program_science',
  LAW:  'program_law',
};

/* =============================================================
   POST /api/quiz/submit  ← OLD format
   Body: { answers: ["q1_a", "q2_b", ...], studentId?: string }
============================================================= */
router.post('/submit', async (req, res) => {
  try {
    const { answers, studentId } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array' });
    }

    // Calculate cluster scores
    const scores = { TECH: 0, MED: 0, BUS: 0, SOC: 0, EDU: 0, SCI: 0, LAW: 0 };
    answers.forEach(answerId => {
      const weights = answerWeights[answerId];
      if (weights) {
        Object.keys(weights).forEach(cluster => {
          scores[cluster] += weights[cluster];
        });
      }
    });

    // Find the top cluster
    const topCluster = Object.keys(scores).reduce((a, b) =>
      scores[a] >= scores[b] ? a : b
    );

    // Look up the recommended program
    const programId = clusterToProgramMap[topCluster];
    const program = await prisma.studyProgram.findUnique({
      where: { id: programId },
      include: { school: true }
    });

    if (!program) {
      return res.status(404).json({ error: 'Program not found in database' });
    }

    // Save the result to the database
    // Note: scores is passed as a plain JS object (NOT JSON.stringify) — Prisma handles Json fields
    const result = await prisma.quizResult.create({
      data: {
        scores:     scores,   // plain object — Prisma's Json type needs this
        topCluster: topCluster,
        programId:  program.id,
        studentId:  studentId || null  // null for guest users
      }
    });

    res.json({
      success:        true,
      scores:         scores,
      topCluster:     topCluster,
      recommendation: {
        program: program.name,
        school:  program.school.name,
        careers: program.careers
      },
      resultId: result.id
    });

  } catch (err) {
    console.error('Error in POST /api/quiz/submit:', err);
    res.status(500).json({ error: 'Something went wrong saving the quiz result.' });
  }
});

/* =============================================================
   POST /api/quiz/submit-profile  ← NEW format from updated quiz
   Body: {
     answers: {
       diplomas: [],
       certificates: [],
       educationStatus: '',
       interests: [],
       subjectStrengths: [],
       learningStyle: '',
       preferredField: '',
       careerDirection: ''
     },
     topProgramId: 'program_technology',  // ID of the #1 match
     scores: { TECH: 85, MED: 40, ... },  // Match percentages from frontend
     studentId?: string
   }
============================================================= */
router.post('/submit-profile', async (req, res) => {
  try {
    const { answers, topProgramId, scores, studentId } = req.body;

    // Validate required fields
    if (!topProgramId || !scores || !answers) {
      return res.status(400).json({ error: 'Missing required fields: answers, topProgramId, scores' });
    }

    // Look up the recommended program in the database
    const program = await prisma.studyProgram.findUnique({
      where: { id: topProgramId },
      include: { school: true }
    });

    if (!program) {
      // Don't crash — just return an error message
      return res.status(404).json({ error: `Program "${topProgramId}" not found in database` });
    }

    // Find the top cluster from the scores object
    // scores looks like: { TECH: 85, MED: 40, BUS: 60, ... }
    const topCluster = Object.keys(scores).reduce((a, b) =>
      (scores[a] || 0) >= (scores[b] || 0) ? a : b,
      Object.keys(scores)[0]
    );

    // Save the result to the database
    // We store the full answer profile in the scores field (it's a Json column)
    const result = await prisma.quizResult.create({
      data: {
        // Store both the cluster scores AND the profile answers in the Json column
        scores: {
          clusterScores:   scores,
          profileAnswers:  answers   // the full profile answers
        },
        topCluster: topCluster,
        programId:  program.id,
        studentId:  studentId || null
      }
    });

    res.json({
      success:    true,
      resultId:   result.id,
      topCluster: topCluster,
      recommendation: {
        program: program.name,
        school:  program.school.name
      }
    });

  } catch (err) {
    console.error('Error in POST /api/quiz/submit-profile:', err);
    res.status(500).json({ error: 'Something went wrong saving the quiz result.' });
  }
});

module.exports = router;