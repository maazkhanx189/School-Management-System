const express = require('express');
const {
    createUser,
    getUsers,
    createClass,
    getAnalytics
} = require('../controllers/adminController');

const { protect, authorize, tenantGate } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();

// All routes here require protection and school isolation
router.use(protect);
router.use(tenantGate);
router.use(checkSubscription);

router.route('/users')
    .post(authorize('admin', 'administration'), createUser)
    .get(authorize('admin', 'administration'), getUsers);

router.route('/classes')
    .post(authorize('admin', 'administration'), createClass);

router.route('/analytics')
    .get(authorize('admin'), getAnalytics);

module.exports = router;
