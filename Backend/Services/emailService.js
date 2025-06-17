// backend/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE_HOST,
    port: process.env.EMAIL_SERVICE_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // Use 'true' for 465, 'false' for other ports like 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an inactivity reminder email to a student.
 * @param {string} toEmail Recipient's email address.
 * @param {string} studentName Name of the student.
 * @param {number} reminderCount Number of times this reminder has been sent.
 */
const sendInactivityReminderEmail = async (toEmail, studentName, reminderCount) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: `[Student Progress System] Time to get back to problem solving, ${studentName}!`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello ${studentName},</h2>
        <p>It looks like you haven't made any Codeforces submissions in the last 7 days.</p>
        <p>Consistency is key to improving your problem-solving skills!</p>
        <p>We encourage you to get back to coding and practice regularly.</p>
        <p>This is your <strong>${reminderCount}</strong> reminder.</p>
        <p>Keep up the good work!</p>
        <p>Best regards,</p>
        <p>Your Student Progress Management Team</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #666;">This is an automated email. Please do not reply.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Inactivity reminder email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Error sending inactivity reminder email to ${toEmail}:`, error.message);
    }
};

module.exports = {
    sendInactivityReminderEmail,
};
