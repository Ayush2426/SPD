// frontend/src/components/StudentFormModal.js
import React, { useState, useEffect } from 'react';
import AlertDialog from './alertDialog';
import './studentForm.css'; // Import component-specific CSS

const StudentFormModal = ({ isOpen, onClose, onSubmit, student }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        codeforcesHandle: '',
        disableInactivityEmail: false,
    });
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                email: student.email || '',
                phoneNumber: student.phoneNumber || '',
                codeforcesHandle: student.codeforcesHandle || '',
                disableInactivityEmail: student.disableInactivityEmail || false,
            });
        } else {
            // Reset form for new student
            setFormData({
                name: '',
                email: '',
                phoneNumber: '',
                codeforcesHandle: '',
                disableInactivityEmail: false,
            });
        }
    }, [student, isOpen]); // Reset when modal opens or student prop changes

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            onClose(); // Close modal on successful submission
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save student. Please try again.';
            setAlertTitle('Submission Error');
            setAlertMessage(errorMessage);
            setIsAlertOpen(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="modal-header">
                    {student ? 'Edit Student' : 'Add New Student'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Name <span className="required-star">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email <span className="required-star">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber" className="form-label">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="codeforcesHandle" className="form-label">
                            Codeforces Handle
                        </label>
                        <input
                            type="text"
                            id="codeforcesHandle"
                            name="codeforcesHandle"
                            value={formData.codeforcesHandle}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    {student && ( // Only show this option for existing students
                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="disableInactivityEmail"
                                name="disableInactivityEmail"
                                checked={formData.disableInactivityEmail}
                                onChange={handleChange}
                                className="checkbox-input"
                            />
                            <label htmlFor="disableInactivityEmail" className="checkbox-label">
                                Disable Inactivity Email Reminders
                            </label>
                        </div>
                    )}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="modal-cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="modal-submit-button"
                        >
                            {student ? 'Update Student' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </div>
            <AlertDialog
                isOpen={isAlertOpen}
                title={alertTitle}
                message={alertMessage}
                onConfirm={() => setIsAlertOpen(false)}
            />
        </div>
    );
};

export default StudentFormModal;
