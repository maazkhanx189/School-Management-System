const Homework = require('../models/Homework');
const Fee = require('../models/Fee');
const FeePayment = require('../models/FeePayment');
const HomeworkSubmission = require('../models/HomeworkSubmission');

// @desc    Get assigned homework (based on student class)
// @route   GET /api/v1/student/homework
// @access  Private (Student)
exports.getMyHomework = async (req, res, next) => {
    try {
        const homework = await Homework.find({
            classId: req.user.classId,
            schoolId: req.user.schoolId
        }).populate('teacherId', 'name').sort('-createdAt');

        res.status(200).json({ success: true, count: homework.length, data: homework });
    } catch (err) {
        next(err);
    }
};

// @desc    Get fee details and payment history
// @route   GET /api/v1/student/fees
// @access  Private (Student)
exports.getMyFees = async (req, res, next) => {
    try {
        const fee = await Fee.findOne({
            studentId: req.user.id,
            schoolId: req.user.schoolId
        });

        const history = await FeePayment.find({
            studentId: req.user.id,
            schoolId: req.user.schoolId
        }).sort('-paymentDate');

        res.status(200).json({
            success: true,
            data: {
                fee,
                payments: history
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Submit homework
// @route   POST /api/v1/student/homework/:homeworkId/submit
// @access  Private (Student)
exports.submitHomework = async (req, res, next) => {
    try {
        const { submissionText } = req.body;
        const { homeworkId } = req.params;

        // Check if homework exists and belongs to student's class
        const homework = await Homework.findOne({
            _id: homeworkId,
            classId: req.user.classId,
            schoolId: req.user.schoolId
        });

        if (!homework) {
            return res.status(404).json({ success: false, error: 'Homework not found or not assigned to your class' });
        }

        // Check if already submitted
        const existingSubmission = await HomeworkSubmission.findOne({
            homeworkId,
            studentId: req.user.id
        });

        if (existingSubmission) {
            return res.status(400).json({ success: false, error: 'You have already submitted this homework' });
        }

        // Determine if submission is late
        const isLate = new Date() > new Date(homework.dueDate);

        const submission = await HomeworkSubmission.create({
            homeworkId,
            studentId: req.user.id,
            submissionText,
            status: isLate ? 'late' : 'submitted',
            schoolId: req.user.schoolId
        });

        res.status(201).json({ success: true, data: submission });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my homework submissions
// @route   GET /api/v1/student/submissions
// @access  Private (Student)
exports.getMySubmissions = async (req, res, next) => {
    try {
        const submissions = await HomeworkSubmission.find({
            studentId: req.user.id,
            schoolId: req.user.schoolId
        }).populate('homeworkId', 'title dueDate').sort('-submittedAt');

        res.status(200).json({ success: true, data: submissions });
    } catch (err) {
        next(err);
    }
};
