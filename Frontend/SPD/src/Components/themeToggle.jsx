// frontend/src/components/ThemeToggle.js
import React from 'react';
import { useTheme } from '../Context/themeContext';
import './themeToggle.css'; // Import component-specific CSS

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-button"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3a9 9 0 00-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16a7 7 0 110-14 7 7 0 010 14z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3a9 9 0 00-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16a7 7 0 110-14 7 7 0 010 14z" />
                </svg>
            )}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
    );
};

export default ThemeToggle;
