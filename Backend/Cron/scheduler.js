// backend/cron/scheduler.js
const cron = require('node-cron');
const Student = require('../Model/Students');
const Submission = require('../Model/Submission');
const { syncCodeforcesData } = require('../Services/codeForceService');
const { sendInactivityReminderEmail } = require('../Services/emailService');
require('dotenv').config();

let currentCronJob = null; // To hold the current cron job instance

/**
 * Runs the daily Codeforces data sync for all students.
 */
const runCodeforcesSync = async () => {
    console.log('Starting daily Codeforces data synchronization...');
    const students = await Student.find({}); // Get all students
    for (const student of students) {
        await syncCodeforcesData(student);
    }
    console.log('Finished daily Codeforces data synchronization.');
};

/**
 * Checks for inactive students and sends reminder emails.
 */
const checkInactivityAndSendReminders = async () => {
    console.log('Checking for inactive students...');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const students = await Student.find({
        codeforcesHandle: { $exists: true, $ne: null }, // Only consider students with CF handles
        disableInactivityEmail: false, // Only send if email is not disabled
    });

    for (const student of students) {
        // Find the latest accepted submission for the student
        const latestSubmission = await Submission.findOne({
            student: student._id,
            verdict: 'OK'
        }).sort({ submissionTime: -1 });

        if (!latestSubmission || latestSubmission.submissionTime < sevenDaysAgo) {
            console.log(`Student ${student.name} is inactive. Last submission: ${latestSubmission ? latestSubmission.submissionTime : 'Never'}`);

            // Increment reminder count
            student.inactivityReminderCount = (student.inactivityReminderCount || 0) + 1;
            await student.save();

            // Send email
            await sendInactivityReminderEmail(
                student.email,
                student.name,
                student.inactivityReminderCount
            );
        }
    }
    console.log('Finished checking for inactive students.');
};

/**
 * Initializes and schedules the cron jobs.
 * @param {string} cronSchedule The cron schedule string (e.g., "0 2 * * *").
 */
const initCronJobs = (cronSchedule = process.env.CRON_SCHEDULE_TIME) => {
    // If a job is already running, destroy it first
    if (currentCronJob) {
        currentCronJob.destroy();
        console.log('Previous cron job destroyed.');
    }

    // Schedule Codeforces data sync
    currentCronJob = cron.schedule(cronSchedule, async () => {
        console.log(`Running scheduled task at ${new Date().toLocaleString()}`);
        await runCodeforcesSync();
        await checkInactivityAndSendReminders();
    }, {
        scheduled: true,
        timezone: "Etc/UTC" // Use UTC to avoid timezone issues with cron expressions
    });

    console.log(`Cron jobs scheduled to run daily at UTC time: ${cronSchedule}`);
    console.log('Initial sync and inactivity check will run shortly after server starts...');
    // Run once immediately after startup for initial data or if server restarted
    runCodeforcesSync();
    checkInactivityAndSendReminders();
};

module.exports = {
    initCronJobs,
};
