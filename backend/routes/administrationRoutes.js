const express = require('express');
const {
    assignTask,
    recordFeePayment,
    getFeeReports,
    getAttendanceReport
} = require('../controllers/administrationController');
const {
    createUser,
    getUsers,
    updateUser,
    deleteUser
} = require('../controllers/adminController');

const { protect, authorize, tenantGate } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();

router.use(protect);
router.use(tenantGate);
router.use(checkSubscription);

router.post('/tasks', authorize('administration'), assignTask);
router.post('/fees/:studentId/pay', authorize('administration'), recordFeePayment);
router.get('/fee-reports', authorize('administration', 'admin'), getFeeReports);
router.get('/attendance-report', authorize('administration'), getAttendanceReport);

// User management for administration
router.post('/create-teacher', authorize('administration'), (req, res, next) => {
    req.body.role = 'teacher';
    createUser(req, res, next);
});

router.post('/create-student', authorize('administration'), (req, res, next) => {
    req.body.role = 'student';
    createUser(req, res, next);
});

router.get('/teachers', authorize('administration'), (req, res, next) => {
    req.query.role = 'teacher';
    getUsers(req, res, next);
});

router.get('/students', authorize('administration'), (req, res, next) => {
    req.query.role = 'student';
    getUsers(req, res, next);
});

router.put('/users/:id', authorize('administration'), updateUser);
router.delete('/users/:id', authorize('administration'), deleteUser);

router.get('/staff', authorize('administration'), async (req, res, next) => {
    try {
        const User = require('../models/User');
        const staff = await User.find({
            schoolId: req.user.schoolId,
            role: { $in: ['teacher', 'administration'] }
        });
        res.status(200).json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
