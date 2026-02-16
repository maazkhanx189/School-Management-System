const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a class name'],
        trim: true
    },
    section: {
        type: String,
        required: [true, 'Please add a section']
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure class name and section are unique within a school
classSchema.index({ name: 1, section: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
