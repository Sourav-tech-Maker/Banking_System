const nodemailer = require('nodemailer');
const config = require('../config/config')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});




// Function to send email
async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `"YONO App" <${config.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
// New Device LoginEmail

async function sendNewDeviceLoginEmail(email, username) {
    const html = `
        <h2>New Device Login</h2>
        <p>Hello ${username},</p>
        <p>Your account was logged in from a new device.</p>
        <p>If this wasn't you, please change your password immediately.</p>
        <br>
        <p>Regards,</p>
        <p>Secure Bank Team</p>
    `;

    const text = `
Hello ${username},
Your account was logged in from a new device.
If this wasn't you, please change your password immediately.
Regards,
Secure Bank Team
`;
    return sendEmail(email, "New Device Login Detected", text, html);
}



async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to YONO App - Account Registration Successful";

    const text = `
Dear ${name},

Welcome to YONO App.

Your account has been successfully registered and is now ready to use.

For your security:
• Never share your password or OTP with anyone.
• Always verify the website before logging in.
• Contact support immediately if you notice suspicious activity.

Thank you for choosing YONO App.

Regards,
YONO App Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
            <h2>🏦 YONO App</h2>
        </div>

        <div style="padding: 25px;">
            <h3>Hello ${name},</h3>

            <p>
                Welcome to <strong>YONO App</strong>.
                Your account has been successfully registered and is now ready to use.
            </p>

            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
                <strong>Security Tips:</strong>
                <ul>
                    <li>Never share your password or OTP.</li>
                    <li>Use a strong and unique password.</li>
                    <li>Report suspicious activity immediately.</li>
                </ul>
            </div>

            <p>
                We're delighted to have you with us and look forward to providing you with a secure banking experience.
            </p>

            <p>
                Regards,<br>
                <strong>YONO App Team</strong>
            </p>
        </div>

        <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            © 2026 YONO App. All Rights Reserved.<br>
            This is an automated email. Please do not reply.
        </div>

    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(
    userEmail,
    name,
    amount,
    toAccount,
    transactionDetails
) {
    const subject = "Transaction Successful";

    const text = `Hello ${name},

Your transaction has been completed successfully.

Amount: ₹${amount}
Recipient Account: ${toAccount}

${transactionDetails}

Thank you for banking with us.
`;

    const html = `
    <div style="
        max-width:600px;
        margin:auto;
        font-family:Inter,Segoe UI,sans-serif;
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:16px;
        overflow:hidden;
    ">

        <div style="
            background:#0f172a;
            color:white;
            padding:20px 24px;
        ">
            <h2 style="margin:0;">Transaction Successful</h2>
        </div>

        <div style="padding:24px;">

            <p style="
                margin-top:0;
                color:#334155;
                font-size:16px;
            ">
                Hello <strong>${name}</strong>,
            </p>

            <p style="color:#475569;">
                Your transaction has been completed successfully.
            </p>

            <div style="
                background:#f8fafc;
                border:1px solid #e2e8f0;
                border-radius:12px;
                padding:20px;
                margin:20px 0;
            ">

                <div style="
                    font-size:14px;
                    color:#64748b;
                    margin-bottom:8px;
                ">
                    Amount Transferred
                </div>

                <div style="
                    font-size:32px;
                    font-weight:700;
                    color:#16a34a;
                ">
                    ₹${amount}
                </div>

            </div>

            <table style="width:100%; border-collapse:collapse;">
                <tr>
                    <td style="padding:8px 0; color:#64748b;">
                        Recipient Account
                    </td>
                    <td style="text-align:right; font-weight:600;">
                        ${toAccount}
                    </td>
                </tr>

                <tr>
                    <td style="padding:8px 0; color:#64748b;">
                        Status
                    </td>
                    <td style="
                        text-align:right;
                        color:#16a34a;
                        font-weight:600;
                    ">
                        Completed
                    </td>
                </tr>
            </table>

            <div style="
                margin-top:20px;
                padding:16px;
                background:#f8fafc;
                border-radius:10px;
                font-size:14px;
                color:#475569;
                white-space:pre-line;
            ">
                ${transactionDetails}
            </div>

        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount, transactionDetails) {
    const subject = "Transaction Failure Notification";
    const text = `Hi ${name},\n\nWe regret to inform you that a transaction of $${amount} to account ${toAccount} has failed.\n\nTransaction Details:\n${transactionDetails}\n\nPlease check your account and try again. If you have any questions, feel free to contact our support team.\n\nBest regards,\nYONO App Team`;
    const html = `<p>Hi ${name},</p><p>We regret to inform you that a transaction of <strong>$${amount}</strong> to account <strong>${toAccount}</strong> has failed.</p><p><strong>Transaction Details:</strong></p><pre>${transactionDetails}</pre><p>Please check your account and try again. If you have any questions, feel free to contact our support team.</p><p>Best regards,<br/>YONO App Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendPasswordResetEmail(userEmail, name, resetLink) {
    const subject = "Password Reset Request";
    const text = `Hi ${name},\n\nWe received a request to reset your password. Please click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nYONO App Team`;
    const html = `<p>Hi ${name},</p><p>We received a request to reset your password. Please click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request a password reset, please ignore this email.</p><p>Best regards,<br/>YONO App Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}


module.exports = { sendEmail, sendNewDeviceLoginEmail, sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail, sendPasswordResetEmail };
