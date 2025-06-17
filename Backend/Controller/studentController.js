// backend/controllers/studentController.js
const Student = require('../Model/Students');
const Contest = require('../Model/Contest');
const Submission = require('../Model/Submission');
const { syncCodeforcesData } = require('../Services/codeForceService');
const { initCronJobs } = require('../Cron/scheduler'); // For rescheduling cron

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Public
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res) => {
    const { name, email, phoneNumber, codeforcesHandle } = req.body;

    try {
        const studentExists = await Student.findOne({ email });
        if (studentExists) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }

        const student = await Student.create({
            name,
            email,
            phoneNumber,
            codeforcesHandle,
        });

        // If a Codeforces handle is provided, sync data immediately
        if (codeforcesHandle) {
            console.log(`New student with CF handle added. Initiating real-time sync for ${codeforcesHandle}`);
            await syncCodeforcesData(student);
        }

        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res) => {
    const { name, email, phoneNumber, codeforcesHandle, disableInactivityEmail } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            const oldHandle = student.codeforcesHandle;
            student.name = name || student.name;
            student.email = email || student.email;
            student.phoneNumber = phoneNumber || student.phoneNumber;
            student.codeforcesHandle = codeforcesHandle || student.codeforcesHandle;
            // Ensure disableInactivityEmail is explicitly set if provided, otherwise retain current
            student.disableInactivityEmail = typeof disableInactivityEmail === 'boolean' ? disableInactivityEmail : student.disableInactivityEmail;


            const updatedStudent = await student.save();

            // If Codeforces handle has changed or a new one is added, re-sync data
            if (codeforcesHandle && codeforcesHandle !== oldHandle) {
                console.log(`Codeforces handle updated for ${updatedStudent.name}. Initiating real-time sync for ${codeforcesHandle}`);
                // Clear old contest/submission data for this student if handle changed
                await Contest.deleteMany({ student: updatedStudent._id });
                await Submission.deleteMany({ student: updatedStudent._id });
                await syncCodeforcesData(updatedStudent);
            }

            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            // Also delete associated contest and submission data
            await Contest.deleteMany({ student: student._id });
            await Submission.deleteMany({ student: student._id });
            await student.deleteOne(); // Use deleteOne() instead of remove()
            res.json({ message: 'Student and associated data removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's contest history
// @route   GET /api/students/:id/contest-history
// @access  Public
const getStudentContestHistory = async (req, res) => {
    const { id } = req.params;
    const { days } = req.query; // 30, 90, 365

    try {
        let queryDate = new Date();
        if (days) {
            queryDate.setDate(queryDate.getDate() - parseInt(days));
        } else {
            // Default to all history if no days filter
            queryDate = new Date(0); // Epoch time
        }

        const contests = await Contest.find({
            student: id,
            participationTime: { $gte: queryDate }
        }).sort({ participationTime: 1 }); // Sort by time for graph

        res.json(contests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's problem solving data
// @route   GET /api/students/:id/problem-solving-data
// @access  Public
const getStudentProblemSolvingData = async (req, res) => {
    const { id } = req.params;
    const { days } = req.query; // 7, 30, 90

    try {
        let queryDate = new Date();
        if (days) {
            queryDate.setDate(queryDate.getDate() - parseInt(days));
        } else {
            // Default to all time if no days filter
            queryDate = new Date(0);
        }

        const submissions = await Submission.find({
            student: id,
            verdict: 'OK', // Only successful submissions
            submissionTime: { $gte: queryDate }
        }).sort({ submissionTime: 1 }); // Sort by time for heatmap

        // Calculate metrics
        let totalProblemsSolved = 0;
        let mostDifficultProblem = null;
        let totalRating = 0;
        let problemCount = 0;
        const solvedProblemsSet = new Set(); // To count unique problems
        const problemRatingBuckets = {}; // For bar chart
        const submissionHeatmap = {}; // For heatmap data

        for (const sub of submissions) {
            const problemIdentifier = sub.problemId; // e.g., "contestId_index"
            if (!solvedProblemsSet.has(problemIdentifier)) {
                solvedProblemsSet.add(problemIdentifier);
                totalProblemsSolved++;
                totalRating += sub.problemRating;
                problemCount++;

                // Most difficult problem
                if (!mostDifficultProblem || sub.problemRating > mostDifficultProblem.rating) {
                    mostDifficultProblem = { name: sub.problemName, rating: sub.problemRating };
                }

                // Problem rating buckets (e.g., 800-900, 900-1000)
                const bucket = Math.floor(sub.problemRating / 100) * 100;
                if (bucket > 0) { // Only count problems with a rating
                    problemRatingBuckets[bucket] = (problemRatingBuckets[bucket] || 0) + 1;
                }
            }

            // Submission Heatmap data (YYYY-MM-DD format)
            const submissionDate = sub.submissionTime.toISOString().split('T')[0];
            submissionHeatmap[submissionDate] = (submissionHeatmap[submissionDate] || 0) + 1;
        }

        const averageRating = problemCount > 0 ? (totalRating / problemCount).toFixed(2) : 0;
        const daysConsidered = (new Date().getTime() - queryDate.getTime()) / (1000 * 60 * 60 * 24);
        const averageProblemsPerDay = daysConsidered > 0 ? (totalProblemsSolved / daysConsidered).toFixed(2) : 0;

        res.json({
            totalProblemsSolved,
            mostDifficultProblem,
            averageRating,
            averageProblemsPerDay,
            problemRatingBuckets,
            submissionHeatmap,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update cron job schedule
// @route   PUT /api/cron/schedule
// @access  Public
const updateCronSchedule = async (req, res) => {
    const { schedule } = req.body; // e.g., "0 3 * * *" for 3 AM UTC

    if (!schedule) {
        return res.status(400).json({ message: 'Cron schedule is required' });
    }

    // Basic validation (can be enhanced)
    const cronRegex = /^(\d+|\*) (\d+|\*) (\d+|\*) (\d+|\*) (\d+|\*)$/;
    if (!cronRegex.test(schedule)) {
        return res.status(400).json({ message: 'Invalid cron schedule format. Expected: "minute hour dayOfMonth month dayOfWeek"' });
    }

    try {
        // Re-initialize cron jobs with the new schedule
        initCronJobs(schedule);
        process.env.CRON_SCHEDULE_TIME = schedule; // Update in memory for future reference
        // You might want to persist this in a config collection in DB for persistence across server restarts
        // For this example, we'll rely on env var or restart to default
        res.json({ message: `Cron job successfully updated to run at: ${schedule}` });
    } catch (error) {
        console.error("Error updating cron schedule:", error);
        res.status(500).json({ message: "Failed to update cron schedule" });
    }
};

module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentContestHistory,
    getStudentProblemSolvingData,
    updateCronSchedule,
};
