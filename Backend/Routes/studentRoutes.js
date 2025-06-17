// backend/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentContestHistory,
    getStudentProblemSolvingData,
    updateCronSchedule,
} = require('../Controller/studentController');

router.route('/')
    .get(getStudents) // Get all students
    .post(createStudent); // Create a new student

router.route('/:id')
    .get(getStudentById) // Get a single student by ID
    .put(updateStudent) // Update a student
    .delete(deleteStudent); // Delete a student

router.get('/:id/contest-history', getStudentContestHistory); // Get contest history for a student
router.get('/:id/problem-solving-data', getStudentProblemSolvingData); // Get problem solving data for a student

// Route to update cron schedule
router.put('/cron/schedule', updateCronSchedule);

module.exports = router;
