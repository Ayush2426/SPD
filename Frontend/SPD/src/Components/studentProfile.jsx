// frontend/src/components/StudentProfile.js
import React, { useState, useEffect } from 'react';
import ContestHistory from './contestHistory';
import ProblemSolvingData from './problemSolving';
import * as studentApi from '../API/studentApi';
import { format } from 'date-fns';
import './studentProfile.css'; // Import component-specific CSS

const StudentProfile = ({ student, onBackToList }) => {
    const [currentStudent, setCurrentStudent] = useState(student);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // When the student prop changes (e.g., if a student is edited in the table view),
        // update the local state and re-fetch if necessary.
        if (student && student._id !== currentStudent?._id) {
            setCurrentStudent(student);
            fetchStudentDetails(student._id);
        } else if (student) {
            // Initial load or if student prop is the same, just set it
            setCurrentStudent(student);
            setLoading(false);
        }
    }, [student]);

    // Function to refetch student details (e.g., after an edit that updates CF handle)
    const fetchStudentDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await studentApi.getStudentById(id);
            setCurrentStudent(response.data);
        } catch (err) {
            setError('Failed to load student profile details.');
            console.error('Error fetching student details for profile:', err);
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <div className="loading-message">Loading student profile...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!currentStudent) return <div className="no-data-message">No student selected.</div>;

    return (
        <div className="profile-container card-shadow">
            <div className="profile-header">
                <button
                    onClick={onBackToList}
                    className="back-button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Students
                </button>
                <h2 className="profile-title">
                    {currentStudent.name}'s Profile
                </h2>
            </div>

            <div className="details-grid">
                <div className="student-details-card">
                    <h4 className="details-card-title">Student Details</h4>
                    <p className="details-card-text"><strong>Email:</strong> {currentStudent.email}</p>
                    <p className="details-card-text"><strong>Phone:</strong> {currentStudent.phoneNumber || 'N/A'}</p>
                    <p className="details-card-text">
                        <strong>Codeforces Handle:</strong>{' '}
                        {currentStudent.codeforcesHandle ? (
                            <a href={`https://codeforces.com/profile/${currentStudent.codeforcesHandle}`} target="_blank" rel="noopener noreferrer">
                                {currentStudent.codeforcesHandle}
                            </a>
                        ) : (
                            'N/A'
                        )}
                    </p>
                    <p className="details-card-text"><strong>Current Rating:</strong> {currentStudent.currentRating || 'N/A'}</p>
                    <p className="details-card-text"><strong>Max Rating:</strong> {currentStudent.maxRating || 'N/A'}</p>
                    <p className="details-card-text">
                        <strong>Last CF Sync:</strong> {currentStudent.lastDataSync ? format(new Date(currentStudent.lastDataSync), 'yyyy-MM-dd HH:mm') : 'Never'}
                    </p>
                    <p className="details-card-text">
                        <strong>Inactivity Reminders Sent:</strong> {currentStudent.inactivityReminderCount} {currentStudent.disableInactivityEmail && <span className="email-disabled-indicator">(Disabled)</span>}
                    </p>
                </div>
            </div>

            {currentStudent.codeforcesHandle ? (
                <>
                    <ContestHistory studentId={currentStudent._id} />
                    <ProblemSolvingData studentId={currentStudent._id} />
                </>
            ) : (
                <div className="no-cf-handle-message">
                    <p className="font-semibold">No Codeforces Handle Detected:</p>
                    <p>Please add a Codeforces handle for this student to view their contest history and problem-solving data.</p>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
