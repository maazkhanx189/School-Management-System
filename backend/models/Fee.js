const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalAmount: {
        type: Number,
        required: [true, 'Please add total amount']
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: function () {
            return this.totalAmount - this.paidAmount;
        }
    },
    month: {
        type: String,
        required: [true, 'Please specify the month']
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update remaining amount before saving
feeSchema.pre('save', function (next) {
    this.remainingAmount = this.totalAmount - this.paidAmount;
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Fee', feeSchema);
