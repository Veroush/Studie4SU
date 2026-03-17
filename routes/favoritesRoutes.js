// Raksha's file
'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/favoritescontroller');

router.get('/me',                         ctrl.getMyFavorites);
router.post('/schools',                   ctrl.addSchool);
router.delete('/schools/:schoolId',       ctrl.removeSchool);
router.post('/programs',                  ctrl.addProgram);
router.delete('/programs/:programId',     ctrl.removeProgram);
router.post('/openhouses',                ctrl.addOpenHouse);
router.delete('/openhouses/:openHouseId', ctrl.removeOpenHouse);

module.exports = router;