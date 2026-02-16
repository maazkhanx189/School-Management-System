const Homework = require('../models/Homework');
const Task = require('../models/Task');
const Class = require('../models/Class');
const HomeworkSubmission = require('../models/HomeworkSubmission');

// @desc    Assign homework to class
// @route   POST /api/v1/teacher/homework
// @access  Private (Teacher)
exports.assignHomework = async (req, res, next) => {
    try {
        const { title, description, dueDate, classId } = req.body;

        const homework = await Homework.create({
            title,
            description,
            dueDate,
            classId,
            teacherId: req.user.id,
            schoolId: req.user.schoolId
        });

        res.status(201).json({ success: true, data: homework });
    } catch (err) {
        next(err);
    }
};

// @desc    Get homework history for teacher
// @route   GET /api/v1/teacher/homework
// @access  Private (Teacher)
exports.getTeacherHomework = async (req, res, next) => {
    try {
        const homework = await Homework.find({
            teacherId: req.user.id,
            schoolId: req.user.schoolId
        }).populate('classId', 'name section');

        res.status(200).json({ success: true, count: homework.length, data: homework });
    } catch (err) {
        next(err);
    }
};

// @desc    Get tasks assigned to me
// @route   GET /api/v1/teacher/tasks
// @access  Private (Teacher)
exports.getMyTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({
            assignedTo: req.user.id,
            schoolId: req.user.schoolId
        }).populate('assignedBy', 'name');

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark task as completed
// @route   PUT /api/v1/teacher/tasks/:id/complete
// @access  Private (Teacher)
exports.completeTask = async (req, res, next) => {
    try {
        let task = await Task.findOne({ _id: req.params.id, assignedTo: req.user.id });

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found or not assigned to you' });
        }

        task.status = 'completed';
        await task.save();

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my assigned classes
// @route   GET /api/v1/teacher/classes
// @access  Private (Teacher)
exports.getMyClasses = async (req, res, next) => {
    try {
        const classes = await Class.find({ teacherId: req.user.id, schoolId: req.user.schoolId });
        res.status(200).json({ success: true, data: classes });
    } catch (err) {
        next(err);
    }
};

// @desc    Get homework submissions for a specific homework
// @route   GET /api/v1/teacher/homework/:homeworkId/submissions
// @access  Private (Teacher)
exports.getHomeworkSubmissions = async (req, res, next) => {
    try {
        const { homeworkId } = req.params;

        // Verify homework belongs to this teacher
        const homework = await Homework.findOne({
            _id: homeworkId,
            teacherId: req.user.id,
            schoolId: req.user.schoolId
        });

        if (!homework) {
            return res.status(404).json({ success: false, error: 'Homework not found or not assigned by you' });
        }

        const submissions = await HomeworkSubmission.find({
            homeworkId,
            schoolId: req.user.schoolId
        }).populate('studentId', 'name email').sort('-submittedAt');

        res.status(200).json({ success: true, data: submissions });
    } catch (err) {
        next(err);
    }
};
