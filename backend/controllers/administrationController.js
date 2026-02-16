const Task = require('../models/Task');
const Fee = require('../models/Fee');
const FeePayment = require('../models/FeePayment');
const User = require('../models/User');

// @desc    Assign task to teacher
// @route   POST /api/v1/administration/tasks
// @access  Private (Administration)
exports.assignTask = async (req, res, next) => {
    try {
        const { title, description, teacherId } = req.body;

        const task = await Task.create({
            title,
            description,
            assignedTo: teacherId,
            assignedBy: req.user.id,
            schoolId: req.user.schoolId
        });

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// @desc    Record fee payment
// @route   POST /api/v1/administration/fees/:studentId/pay
// @access  Private (Administration)
exports.recordFeePayment = async (req, res, next) => {
    try {
        const { amount, paymentMethod, note } = req.body;
        const { studentId } = req.params;

        const fee = await Fee.findOne({ studentId, schoolId: req.user.schoolId });

        if (!fee) {
            return res.status(404).json({ success: false, error: 'Fee record not found for this student' });
        }

        // Create payment record
        const payment = await FeePayment.create({
            studentId,
            feeId: fee._id,
            amount,
            recordedBy: req.user.id,
            schoolId: req.user.schoolId,
            paymentMethod,
            note
        });

        // Update fee record
        fee.paidAmount += amount;
        await fee.save();

        res.status(201).json({ success: true, data: payment, updatedFee: fee });
    } catch (err) {
        next(err);
    }
};

// @desc    Get fee reports
// @route   GET /api/v1/administration/fee-reports
// @access  Private (Administration, Admin)
exports.getFeeReports = async (req, res, next) => {
    try {
        const fees = await Fee.find({ schoolId: req.user.schoolId }).populate('studentId', 'name email');
        res.status(200).json({ success: true, data: fees });
    } catch (err) {
        next(err);
    }
};
