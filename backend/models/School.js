const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a school name'],
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    subscriptionStart: {
        type: Date,
        default: Date.now
    },
    subscriptionEnd: {
        type: Date,
        required: [true, 'Please add a subscription end date']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('School', schoolSchema);
