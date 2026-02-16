const Homework = require('../models/Homework');
const Fee = require('../models/Fee');
const FeePayment = require('../models/FeePayment');

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
                paymentHistory: history
            }
        });
    } catch (err) {
        next(err);
    }
};
