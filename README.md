# SPD

Student Progress Management System
This project is a Student Progress Management System built with the MERN (MongoDB, Express.js, React, Node.js) stack. It allows administrators to manage student records, track their Codeforces contest history and problem-solving progress, and send automated inactivity reminders.

Features
Student Table View:

List all enrolled students with Name, Email, Phone Number, Codeforces Handle, Current Rating, Max Rating.

Add, Edit, and Delete student records.

Download student data as a CSV file.

View detailed student profiles.

Student Profile View:

Contest History:

Filter contests by last 30, 90, or 365 days.

Display a Codeforces rating graph.

List of contests with rating changes, ranks, and (placeholder for unsolved problems).

Problem Solving Data:

Filter data by last 7, 30, or 90 days.

Show metrics: Most difficult problem solved, Total problems solved, Average rating, Average problems per day.

Bar chart of problems solved per rating bucket.

Submission heatmap.

Codeforces Data Sync:

Automatically fetches and stores updated Codeforces data for all students with a Codeforces handle once a day via a cron job (default 2 AM UTC).

Real-time data fetch when a student's Codeforces handle is added or updated.

Displays the last data update timestamp for each student in the main table.

Inactivity Detection & Email Reminders:

Identifies students who haven't made any Codeforces submissions in the last 7 days after each sync.

Sends automated email reminders to inactive students.

Tracks and displays the number of reminder emails sent per user.

Provides an option to disable automatic emails for individual students.

User Interface:

Mobile and tablet responsive design.

Light and Dark mode with a toggle option.

Technology Stack
Frontend: React.js, Tailwind CSS, Chart.js, react-calendar-heatmap

Backend: Node.js, Express.js, Mongoose

Database: MongoDB

Scheduling: node-cron

External API: Codeforces API

Emailing: Nodemailer

Installation and Setup
Prerequisites
Node.js (LTS version recommended)

npm (Node Package Manager)

MongoDB (running locally or a cloud instance like MongoDB Atlas)
