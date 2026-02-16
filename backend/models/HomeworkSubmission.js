const mongoose = require('mongoose');

const homeworkSubmissionSchema = new mongoose.Schema({
    homeworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissionText: {
        type: String,
        required: [true, 'Please add submission content']
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['submitted', 'late', 'graded'],
        default: 'submitted'
    },
    grade: {
        type: String,
        default: null
    },
    teacherFeedback: {
        type: String,
        default: null
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    }
}, {
    timestamps: true
});

// Ensure one submission per student per homework
homeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);
