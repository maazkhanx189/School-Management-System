const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Multi-tenant isolation middleware
// Ensures the user can only access data belonging to their school
exports.tenantGate = (req, res, next) => {
    // If a request provides a schoolId (e.g. in body or query), it must match the user's schoolId
    // unless the user is a super admin (if you had one, but here each school owner is their own admin)

    const requestedSchoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;

    if (requestedSchoolId && requestedSchoolId !== req.user.schoolId.toString()) {
        return res.status(403).json({
            success: false,
            error: 'Cross-tenant data access is strictly prohibited'
        });
    }

    // Inject schoolId into req for consistent query filtering in controllers
    req.schoolId = req.user.schoolId;
    next();
};
