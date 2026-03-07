const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an email to the user when the status of their issue changes.
 * @param {string} email - The user's email address
 * @param {string} issueTitle - The title of the reported issue
 * @param {string} status - The new status of the issue
 */
const sendIssueStatusMail = async (email, issueTitle, status) => {
    try {
        const info = await transporter.sendMail({
            from: `"Parvah Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Issue Status Update',
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1a1a3e;">
            <h2 style="color: #088395;">Issue Status Update</h2>
            <p>Hello,</p>
            <p>The status of your reported issue <strong>"${issueTitle}"</strong> has been updated to:</p>
            <div style="padding: 10px 15px; background: #f9f9fb; border-left: 4px solid #088395; margin: 20px 0; font-weight: bold;">
                ${status.toUpperCase().replace(/_/g, ' ')}
            </div>
            <p>You can track the progress of your issue on your dashboard.</p>
            <br />
            <p>Best regards,</p>
            <p><strong>Parvah Team</strong></p>
        </div>
      `,
        });
        console.log(`[sendMail:SUCCESS] Email sent for issue="${issueTitle}" to=${email} status=${status} messageId=${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[sendMail:FAILED] Failed to send email to=${email}:`, error.message);
        throw error;
    }
};

module.exports = {
    sendIssueStatusMail,
};
