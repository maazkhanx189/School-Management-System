const User = require('../models/User');
const School = require('../models/School');
const logActivity = require('../utils/logger');

// @desc    Register a new School and its Admin
// @route   POST /api/v1/auth/register-school
// @access  Public
exports.registerSchoolAdmin = async (req, res, next) => {
    try {
        const { schoolName, address, phoneNumber, email, adminName, adminPassword } = req.body;

        // Create School with 30 day trial
        const subscriptionEnd = new Date();
        subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

        const school = await School.create({
            name: schoolName,
            address,
            phoneNumber,
            email,
            subscriptionEnd
        });

        // Create Admin User for this school
        const user = await User.create({
            name: adminName,
            email,
            password: adminPassword,
            role: 'admin',
            schoolId: school._id,
            mustChangePassword: true
        });

        await logActivity(user._id, 'Registered School', 'Auth', school._id);

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check school status for non-superadmins
        if (user.role !== 'superadmin') {
            const school = await School.findById(user.schoolId);
            if (!school) {
                return res.status(404).json({ success: false, error: 'Associated school not found' });
            }

            if (!school.isActive) {
                return res.status(403).json({ success: false, error: 'Your school account is deactivated.' });
            }

            const today = new Date();
            if (school.subscriptionEnd < today) {
                return res.status(403).json({ success: false, error: 'Subscription expired. Please renew.' });
            }
        }

        await logActivity(user._id, 'Logged In', 'Auth', user.schoolId);

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Change password
// @route   PUT /api/v1/auth/changepassword
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        user.mustChangePassword = false;
        await user.save();

        await logActivity(user._id, 'Changed Password', 'Auth', user.schoolId);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('schoolId', 'name');
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        mustChangePassword: user.mustChangePassword
    });
};
