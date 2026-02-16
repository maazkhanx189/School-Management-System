const School = require('../models/School');
const User = require('../models/User');
const logActivity = require('../utils/logger');

// @desc    Create a new School
// @route   POST /api/v1/superadmin/schools
// @access  Private (SuperAdmin)
exports.createSchool = async (req, res, next) => {
    try {
        const { name, email, address, phoneNumber, subscriptionEnd } = req.body;

        const school = await School.create({
            name,
            email,
            address,
            phoneNumber,
            subscriptionEnd
        });

        await logActivity(req.user.id, 'Created School', 'SuperAdmin', null, { schoolName: name });

        res.status(201).json({
            success: true,
            data: school
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all schools
// @route   GET /api/v1/superadmin/schools
// @access  Private (SuperAdmin)
exports.getSchools = async (req, res, next) => {
    try {
        const schools = await School.find();

        res.status(200).json({
            success: true,
            count: schools.length,
            data: schools
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create Admin for a School
// @route   POST /api/v1/superadmin/create-admin
// @access  Private (SuperAdmin)
exports.createAdmin = async (req, res, next) => {
    try {
        const { name, email, password, schoolId } = req.body;

        // Check if school exists
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ success: false, error: 'School not found' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'admin',
            schoolId,
            mustChangePassword: true
        });

        await logActivity(req.user.id, 'Created School Admin', 'SuperAdmin', schoolId, { adminEmail: email });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Toggle School Status
// @route   PATCH /api/v1/superadmin/schools/:id/toggle
// @access  Private (SuperAdmin)
exports.toggleSchoolStatus = async (req, res, next) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ success: false, error: 'School not found' });
        }

        school.isActive = !school.isActive;
        await school.save();

        await logActivity(req.user.id, `Toggled School Status: ${school.isActive}`, 'SuperAdmin', school._id);

        res.status(200).json({
            success: true,
            data: school
        });
    } catch (err) {
        next(err);
    }
};
