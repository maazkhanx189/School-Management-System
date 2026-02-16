const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add payment amount']
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Administration
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Online', 'Cheque', 'Other'],
        default: 'Cash'
    },
    note: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('FeePayment', feePaymentSchema);
