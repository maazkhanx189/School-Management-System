const express = require('express');
const {
    createSchool,
    getSchools,
    createAdmin,
    toggleSchoolStatus
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here are restricted to superadmin
router.use(protect);
router.use(authorize('superadmin'));

router.post('/schools', createSchool);
router.get('/schools', getSchools);
router.post('/create-admin', createAdmin);
router.patch('/schools/:id/toggle', toggleSchoolStatus);

module.exports = router;
