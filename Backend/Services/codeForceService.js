
const axios = require('axios');
const Student = require('../Model/Students');
const Contest = require('../Model/Contest');
const Submission = require('../Model/Submission');
require('dotenv').config();

const CF_API_BASE_URL = process.env.CODEFORCES_API_BASE_URL;

/**
 * Fetches user rating history from Codeforces API.
 * @param {string} handle Codeforces handle of the user.
 * @returns {Array} 
 */
const fetchUserRating = async (handle) => {
    try {
        const response = await axios.get(`${CF_API_BASE_URL}user.rating?handle=${handle}`);
        if (response.data.status === 'OK') {
            console.log(`Successfully fetched rating history for ${handle}. Number of entries: ${response.data.result.length}`);
            return response.data.result;
        } else {
            console.error(`Codeforces API Error (user.rating) for ${handle}: ${response.data.comment}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching Codeforces rating for ${handle}:`, error.message);
        return null;
    }
};

/**
 * Fetches user submission status from Codeforces API.
 * @param {string} handle Codeforces handle of the user.
 * @returns {Array} Array of submission objects.
 */
const fetchUserSubmissions = async (handle) => {
    try {
        // We fetch all submissions, but store only 'OK' (Accepted) ones to count solved problems
        const response = await axios.get(`${CF_API_BASE_URL}user.status?handle=${handle}`);
        if (response.data.status === 'OK') {
            console.log(`Successfully fetched submission history for ${handle}. Number of entries: ${response.data.result.length}`);
            return response.data.result;
        } else {
            console.error(`Codeforces API Error (user.status) for ${handle}: ${response.data.comment}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching Codeforces submissions for ${handle}:`, error.message);
        return null;
    }
};

/**
 * Syncs Codeforces data for a given student.
 * Fetches rating history and submissions, updates student profile,
 * and saves contest/submission data to the database.
 * @param {Object} student The student Mongoose object.
 */
const syncCodeforcesData = async (student) => {
    if (!student.codeforcesHandle) {
        console.log(`Student ${student.name} has no Codeforces handle. Skipping sync.`);
        return;
    }

    const handle = student.codeforcesHandle;
    console.log(`Initiating sync for Codeforces handle: ${handle}`);

    try {
        const ratingHistory = await fetchUserRating(handle);
        const submissions = await fetchUserSubmissions(handle);

        let currentRating = student.currentRating;
        let maxRating = student.maxRating;

        // Debugging: Log ratingHistory content
        if (!ratingHistory) {
            console.log(`DEBUG: Rating history is null for ${handle}.`);
        } else if (ratingHistory.length === 0) {
            console.log(`DEBUG: Rating history is empty for ${handle}.`);
        } else {
            console.log(`DEBUG: First rating entry for ${handle}:`, ratingHistory[0]);
            console.log(`DEBUG: Last rating entry for ${handle}:`, ratingHistory[ratingHistory.length - 1]);
        }


        // Update student's current and max rating
        if (ratingHistory && ratingHistory.length > 0) {
            const latestRating = ratingHistory[ratingHistory.length - 1];
            currentRating = latestRating.newRating;
            maxRating = Math.max(student.maxRating || 0, ...ratingHistory.map(r => r.newRating));
            console.log(`DEBUG: Calculated currentRating: ${currentRating}, maxRating: ${maxRating} for ${handle}`);

            // Save contest history
            for (const contestData of ratingHistory) {
                // Check if contest already exists to avoid duplicates
                const existingContest = await Contest.findOne({
                    student: student._id,
                    contestId: contestData.contestId
                });

                if (!existingContest) {
                    await Contest.create({
                        student: student._id,
                        contestId: contestData.contestId,
                        contestName: contestData.contestName,
                        rank: contestData.rank,
                        oldRating: contestData.oldRating,
                        newRating: contestData.newRating,
                        ratingChange: contestData.newRating - contestData.oldRating,
                        participationTime: new Date(contestData.ratingUpdateTimeSeconds * 1000),
                        // unsolvedProblems: This data is not directly available from user.rating.
                        // It would require parsing contest standings or a more complex approach.
                        // For now, it defaults to 0 as per schema.
                    });
                }
            }
        } else {
            console.log(`DEBUG: Skipping rating update for ${handle} as rating history is not available.`);
            // If rating history is not available, retain existing rating or default to 0
            currentRating = student.currentRating || 0;
            maxRating = student.maxRating || 0;
        }

        // Save problem submissions
        if (submissions && submissions.length > 0) {
            for (const submissionData of submissions) {
                // Only store accepted (OK) submissions
                if (submissionData.verdict === 'OK') {
                    const problemId = `${submissionData.problem.contestId || 'noContest'}_${submissionData.problem.index}`;
                    const existingSubmission = await Submission.findOne({
                        student: student._id,
                        submissionId: submissionData.id,
                        problemId: problemId,
                        verdict: 'OK' // Only count unique AC submissions
                    });

                    if (!existingSubmission) {
                        await Submission.create({
                            student: student._id,
                            submissionId: submissionData.id,
                            problemId: problemId,
                            problemName: submissionData.problem.name,
                            problemRating: submissionData.problem.rating || 0, // Some problems might not have rating
                            verdict: submissionData.verdict,
                            submissionTime: new Date(submissionData.creationTimeSeconds * 1000),
                        });
                    }
                }
            }
        } else {
            console.log(`DEBUG: Skipping submission processing for ${handle} as no submissions were fetched or available.`);
        }

        // Update student's overall data and last sync time
        console.log(`DEBUG: Attempting to update student ${handle} with currentRating: ${currentRating}, maxRating: ${maxRating}`);
        const updatedStudentDoc = await Student.findByIdAndUpdate(student._id, {
            currentRating: currentRating,
            maxRating: maxRating,
            lastDataSync: new Date(),
        }, { new: true });

        if (updatedStudentDoc) {
            console.log(`Successfully synced and updated data for ${handle}. New ratings: Current=${updatedStudentDoc.currentRating}, Max=${updatedStudentDoc.maxRating}`);
        } else {
            console.log(`WARNING: Student document not found or not updated for ${handle} after findByIdAndUpdate.`);
        }

    } catch (error) {
        console.error(`Critical error during Codeforces data sync for ${handle}:`, error.message, error.stack);
    }
};

module.exports = {
    fetchUserRating,
    fetchUserSubmissions,
    syncCodeforcesData,
};
