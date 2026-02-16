const express = require('express');
const {
    assignHomework,
    getTeacherHomework,
    getMyTasks,
    completeTask,
    getMyClasses,
    getHomeworkSubmissions
} = require('../controllers/teacherController');

const { protect, authorize, tenantGate } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();

router.use(protect);
router.use(tenantGate);
router.use(checkSubscription);

router.route('/homework')
    .post(authorize('teacher'), assignHomework)
    .get(authorize('teacher'), getTeacherHomework);

router.get('/homework/:homeworkId/submissions', authorize('teacher'), getHomeworkSubmissions);
router.get('/tasks', authorize('teacher'), getMyTasks);
router.put('/tasks/:id/complete', authorize('teacher'), completeTask);
router.get('/classes', authorize('teacher'), getMyClasses);

module.exports = router;
