const School = require('../models/School');

// Middleware to check if school subscription is active
exports.checkSubscription = async (req, res, next) => {
    // Superadmins don't belong to a school
    if (req.user.role === 'superadmin') {
        return next();
    }

    try {
        const school = await School.findById(req.user.schoolId);

        if (!school) {
            return res.status(404).json({
                success: false,
                error: 'School not found'
            });
        }

        if (!school.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Your school account is deactivated. Please contact support.'
            });
        }

        const today = new Date();
        if (school.subscriptionEnd < today) {
            return res.status(403).json({
                success: false,
                error: 'Subscription expired. Please renew to continue using the system.'
            });
        }

        // Warning if subscription ends in less than 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        if (school.subscriptionEnd <= sevenDaysFromNow) {
            res.setHeader('X-Subscription-Warning', 'Your subscription expires in less than 7 days.');
        }

        next();
    } catch (err) {
        next(err);
    }
};
