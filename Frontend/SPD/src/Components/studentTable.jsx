// frontend/src/components/StudentTable.js
import React, { useState, useEffect } from 'react';
import * as studentApi from '../API/studentApi';
import { downloadCSV, convertToCSV } from '../Utils/csvUtils';
import StudentFormModal from './studentForm';
import AlertDialog from './alertDialog';
import { format } from 'date-fns';
import './studentTable.css'; // Import component-specific CSS

const StudentTable = ({ onSelectStudent, onCronScheduleUpdate }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null); // For edit functionality
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    // Note: process.env.REACT_APP_CRON_SCHEDULE_TIME might not be available in a non-Tailwind setup
    // You would typically fetch this from your backend or use a fixed default
    const [cronScheduleInput, setCronScheduleInput] = useState("0 2 * * *"); // Default 2 AM UTC

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await studentApi.getStudents();
            setStudents(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch students. Please try again.');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = () => {
        setSelectedStudent(null); // Clear selected student for add mode
        setIsModalOpen(true);
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (selectedStudent) {
                // Update existing student
                await studentApi.updateStudent(selectedStudent._id, formData);
                setAlertTitle('Success');
                setAlertMessage('Student updated successfully!');
            } else {
                // Add new student
                await studentApi.createStudent(formData);
                setAlertTitle('Success');
                setAlertMessage('Student added successfully!');
            }
            setIsAlertOpen(true);
            fetchStudents(); // Refresh student list
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
            setAlertTitle('Error');
            setAlertMessage(errorMessage);
            setIsAlertOpen(true);
            console.error('Error submitting student form:', err);
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setIsConfirmDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await studentApi.deleteStudent(studentToDelete._id);
            setAlertTitle('Success');
            setAlertMessage('Student deleted successfully!');
            setIsAlertOpen(true);
            fetchStudents(); // Refresh student list
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete student. Please try again.';
            setAlertTitle('Error');
            setAlertMessage(errorMessage);
            setIsAlertOpen(true);
            console.error('Error deleting student:', err);
        } finally {
            setIsConfirmDeleteOpen(false);
            setStudentToDelete(null);
        }
    };

    const handleDownloadCSV = () => {
        const headers = [
            'name', 'email', 'phoneNumber', 'codeforcesHandle',
            'currentRating', 'maxRating', 'lastDataSync', 'inactivityReminderCount'
        ];
        const dataForCsv = students.map(s => ({
            ...s,
            lastDataSync: s.lastDataSync ? format(new Date(s.lastDataSync), 'yyyy-MM-dd HH:mm:ss') : 'N/A'
        }));
        const csv = convertToCSV(dataForCsv, headers);
        downloadCSV(csv, 'students_data.csv');
    };

    const handleUpdateCronSchedule = async () => {
        try {
            await studentApi.updateCronSchedule(cronScheduleInput);
            setAlertTitle('Success');
            setAlertMessage(`Cron schedule updated to "${cronScheduleInput}"!`);
            setIsAlertOpen(true);
            if (onCronScheduleUpdate) {
                onCronScheduleUpdate(cronScheduleInput);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update cron schedule.';
            setAlertTitle('Error');
            setAlertMessage(errorMessage);
            setIsAlertOpen(true);
            console.error('Error updating cron schedule:', err);
        }
    };

    if (loading) return <div className="loading-message">Loading students...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="student-table-container card-shadow">
            <h2 className="student-table-header">Student Roster</h2>

            <div className="controls-row">
                <div className="button-group">
                    <button
                        onClick={handleAddStudent}
                        className="action-button add-student-button"
                    >
                        Add Student
                    </button>
                    <button
                        onClick={handleDownloadCSV}
                        className="action-button download-csv-button"
                    >
                        Download CSV
                    </button>
                </div>

                <div className="cron-config">
                    <label htmlFor="cronSchedule" className="cron-label">
                        Cron Time (UTC):
                    </label>
                    <input
                        type="text"
                        id="cronSchedule"
                        value={cronScheduleInput}
                        onChange={(e) => setCronScheduleInput(e.target.value)}
                        placeholder="e.g., 0 2 * * *"
                        className="cron-input"
                    />
                    <button
                        onClick={handleUpdateCronSchedule}
                        className="action-button update-cron-button"
                    >
                        Update Cron
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>CF Handle</th>
                            <th>Current Rating</th>
                            <th>Max Rating</th>
                            <th>Last CF Update</th>
                            <th>Emails Sent</th>
                            <th className="actions-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id}>
                                <td className="name-column">{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.phoneNumber}</td>
                                <td>
                                    {student.codeforcesHandle ? (
                                        <a href={`https://codeforces.com/profile/${student.codeforcesHandle}`} target="_blank" rel="noopener noreferrer">
                                            {student.codeforcesHandle}
                                        </a>
                                    ) : (
                                        'N/A'
                                    )}
                                </td>
                                <td>{student.currentRating || 'N/A'}</td>
                                <td>{student.maxRating || 'N/A'}</td>
                                <td>
                                    {student.lastDataSync ? format(new Date(student.lastDataSync), 'yyyy-MM-dd HH:mm') : 'Never'}
                                </td>
                                <td>
                                    {student.inactivityReminderCount} {student.disableInactivityEmail && <span className="email-disabled-text">(Disabled)</span>}
                                </td>
                                <td className="actions-cell">
                                    <div className="action-buttons-group">
                                        <button
                                            onClick={() => onSelectStudent(student)}
                                            className="view-details-button"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleEditStudent(student)}
                                            className="edit-button"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(student)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <StudentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                student={selectedStudent}
            />

            <AlertDialog
                isOpen={isConfirmDeleteOpen}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setIsConfirmDeleteOpen(false);
                    setStudentToDelete(null);
                }}
                confirmText="Delete"
                cancelText="Cancel"
            />
            <AlertDialog
                isOpen={isAlertOpen}
                title={alertTitle}
                message={alertMessage}
                onConfirm={() => setIsAlertOpen(false)}
            />
        </div>
    );
};

export default StudentTable;
