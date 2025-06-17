// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThemeToggle from './Components/themeToggle';
import { ThemeProvider } from './Context/themeContext';
import './App.css'; // Import App-wide CSS

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <header className="app-header">
            <h1 className="app-title">Student Progress Management</h1>
            <ThemeToggle />
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </main>
          <footer className="app-footer">
            © {new Date().getFullYear()} Student Progress Management. All rights reserved.
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
