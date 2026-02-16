const AuditLog = require('../models/AuditLog');

const logActivity = async (userId, action, module, schoolId, details = {}, ipAddress = '') => {
    try {
        await AuditLog.create({
            userId,
            action,
            module,
            schoolId,
            details,
            ipAddress
        });
    } catch (err) {
        console.error('Logging Error:', err.message);
    }
};

module.exports = logActivity;
