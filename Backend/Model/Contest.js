// backend/models/Contest.js
const mongoose = require('mongoose');

const contestSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Student',
        },
        contestId: {
            type: Number,
            required: true,
        },
        contestName: {
            type: String,
            required: true,
        },
        rank: {
            type: Number,
            required: true,
        },
        oldRating: {
            type: Number,
            required: true,
        },
        newRating: {
            type: Number,
            required: true,
        },
        ratingChange: {
            type: Number,
            required: true,
        },
        participationTime: { 
            type: Date,
            required: true,
        },
        unsolvedProblems: { 
            type: Number,
            default: 0, 
        }
    },
    {
        timestamps: true, 
    }
);

module.exports = mongoose.model('Contest', contestSchema);
