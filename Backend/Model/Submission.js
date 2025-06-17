// backend/models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Student',
        },
        submissionId: {
            type: Number,
            required: true,
        },
        problemId: { // To uniquely identify the problem (e.g., contestId_index)
            type: String,
            required: true,
        },
        problemName: {
            type: String,
            required: true,
        },
        problemRating: {
            type: Number,
            default: 0,
        },
        verdict: {
            type: String, // e.g., "OK", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED"
            required: true,
        },
        submissionTime: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Submission', submissionSchema);
