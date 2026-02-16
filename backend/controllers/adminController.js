const User = require('../models/User');
const Class = require('../models/Class');
const School = require('../models/School');
const Fee = require('../models/Fee');
const logActivity = require('../utils/logger');

// @desc    Create a new user (Student, Teacher, or Administration)
// @route   POST /api/v1/admin/users
// @access  Private (Admin, Administration)
exports.createUser = async (req, res, next) => {
    try {
        const creatorRole = req.user.role;
        const targetRole = req.body.role;

        // Role Based Restriction
        if (creatorRole === 'admin' && targetRole !== 'administration') {
            return res.status(403).json({ success: false, error: 'Admins can only create Administration users' });
        }

        if (creatorRole === 'administration' && !['teacher', 'student'].includes(targetRole)) {
            return res.status(403).json({ success: false, error: 'Administration can only create Teachers and Students' });
        }

        req.body.schoolId = req.user.schoolId;
        req.body.mustChangePassword = true;

        // If student, ensure classId is provided
        if (targetRole === 'student' && !req.body.classId) {
            return res.status(400).json({ success: false, error: 'Student must be assigned to a class' });
        }

        const user = await User.create(req.body);

        // If student, initialize fee record
        if (user.role === 'student') {
            await Fee.create({
                studentId: user._id,
                schoolId: req.user.schoolId,
                totalAmount: req.body.totalFee || 0,
                month: req.body.feeMonth || new Date().toLocaleString('default', { month: 'long' })
            });
        }

        await logActivity(req.user.id, `Created ${targetRole}: ${user.email}`, 'User Management', req.user.schoolId);

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all users of the school
// @route   GET /api/v1/admin/users
// @access  Private (Admin, Administration)
exports.getUsers = async (req, res, next) => {
    try {
        const { role } = req.query;
        const filter = { schoolId: req.user.schoolId };
        if (role) filter.role = role;

        const users = await User.find(filter).populate('classId', 'name section');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a class
// @route   POST /api/v1/admin/classes
// @access  Private (Admin, Administration)
exports.createClass = async (req, res, next) => {
    try {
        req.body.schoolId = req.user.schoolId;
        const newClass = await Class.create(req.body);
        res.status(201).json({ success: true, data: newClass });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all classes of the school
// @route   GET /api/v1/admin/classes
// @access  Private (Admin, Administration, Teacher)
exports.getClasses = async (req, res, next) => {
    try {
        const classes = await Class.find({ schoolId: req.user.schoolId }).populate('teacherId', 'name');
        res.status(200).json({ success: true, data: classes });
    } catch (err) {
        next(err);
    }
};

// @desc    Get school analytics (Admin Only)
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res, next) => {
    try {
        const schoolId = req.user.schoolId;

        const studentCount = await User.countDocuments({ schoolId, role: 'student' });
        const teacherCount = await User.countDocuments({ schoolId, role: 'teacher' });
        const classCount = await Class.countDocuments({ schoolId });

        const feeData = await Fee.aggregate([
            { $match: { schoolId } },
            {
                $group: {
                    _id: null,
                    totalExpected: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$paidAmount' },
                    totalRemaining: { $sum: '$remainingAmount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                studentCount,
                teacherCount,
                classCount,
                fees: feeData[0] || { totalExpected: 0, totalPaid: 0, totalRemaining: 0 }
            }
        });
    } catch (err) {
        next(err);
    }
};
// @desc    Update a user
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin, Administration)
exports.updateUser = async (req, res, next) => {
    try {
        let user = await User.findOne({ _id: req.params.id, schoolId: req.user.schoolId });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Restriction: Administration cannot update other Administration/Admin
        if (req.user.role === 'administration' && (user.role === 'administration' || user.role === 'admin')) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this user' });
        }

        // If classId is updated for a student
        if (user.role === 'student' && req.body.classId) {
            // Logic could be added here to update fee or other class-specific data if needed
        }

        user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        await logActivity(req.user.id, `Updated ${user.role}: ${user.email}`, 'User Management', req.user.schoolId);

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin, Administration)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.params.id, schoolId: req.user.schoolId });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Restriction same as update
        if (req.user.role === 'administration' && (user.role === 'administration' || user.role === 'admin')) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this user' });
        }

        // If student, delete associated fees
        if (user.role === 'student') {
            await Fee.deleteMany({ studentId: user._id });
        }

        await user.deleteOne();

        await logActivity(req.user.id, `Deleted ${user.role}: ${user.email}`, 'User Management', req.user.schoolId);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
