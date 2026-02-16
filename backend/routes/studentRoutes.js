const express = require('express');
const { getMyHomework, getMyFees } = require('../controllers/studentController');

const { protect, authorize, tenantGate } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();

router.use(protect);
router.use(tenantGate);
router.use(checkSubscription);

router.get('/homework', authorize('student'), getMyHomework);
router.get('/fees', authorize('student'), getMyFees);

module.exports = router;
