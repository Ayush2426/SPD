// backend/models/Student.js
const mongoose = require('mongoose');

const studentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        phoneNumber: {
            type: String,
        },
        codeforcesHandle: {
            type: String,
            unique: true,
            sparse: true, // Allows null values to not enforce unique constraint
        },
        currentRating: {
            type: Number,
            default: 0,
        },
        maxRating: {
            type: Number,
            default: 0,
        },
        lastDataSync: { // Timestamp of the last Codeforces data sync for this user
            type: Date,
            default: null,
        },
        inactivityReminderCount: { // Tracks how many inactivity emails sent
            type: Number,
            default: 0,
        },
        disableInactivityEmail: { // Option to disable email for this student
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('Student', studentSchema);
