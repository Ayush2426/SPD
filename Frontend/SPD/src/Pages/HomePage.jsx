// frontend/src/pages/HomePage.js
import React, { useState } from 'react';
import StudentTable from '../Components/studentTable';
import StudentProfile from '../Components/studentProfile';
import '../App.css'; // Ensure global styles are loaded for container

const HomePage = () => {
    const [selectedStudent, setSelectedStudent] = useState(null); // Holds the student object for profile view

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
    };

    const handleBackToList = () => {
        setSelectedStudent(null);
    };

    return (
        <div className="container app-main-content"> {/* Using 'container' class from index.css for centering and padding */}
            {selectedStudent ? (
                <StudentProfile student={selectedStudent} onBackToList={handleBackToList} />
            ) : (
                <StudentTable onSelectStudent={handleSelectStudent} />
            )}
        </div>
    );
};

export default HomePage;
