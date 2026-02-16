const Task = require('../models/Task');
const Fee = require('../models/Fee');
const FeePayment = require('../models/FeePayment');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get attendance reports
// @route   GET /api/v1/administration/attendance-report
// @access  Private (Administration)
exports.getAttendanceReport = async (req, res, next) => {
    try {
        const attendance = await Attendance.find({ schoolId: req.user.schoolId })
            .populate('userId', 'name role')
            .populate('classId', 'name section')
            .sort({ date: -1 });

        // Calculate some stats
        const stats = {
            students: { present: 0, absent: 0, late: 0, total: 0 },
            teachers: { present: 0, absent: 0, late: 0, total: 0 }
        };

        attendance.forEach(record => {
            const roleKey = record.role === 'student' ? 'students' : 'teachers';
            if (stats[roleKey]) {
                stats[roleKey].total++;
                if (record.status === 'present') stats[roleKey].present++;
                else if (record.status === 'absent') stats[roleKey].absent++;
                else if (record.status === 'late') stats[roleKey].late++;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                records: attendance,
                stats
            }
        });
    } catch (err) {
        next(err);
    }
};


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
