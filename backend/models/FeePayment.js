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
        enum: ['cash', 'bank_transfer', 'cheque', 'other'],
        default: 'cash'
    },
    note: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('FeePayment', feePaymentSchema);
