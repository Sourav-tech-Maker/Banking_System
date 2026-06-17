const nodemailer = require('nodemailer');

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
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking System" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name){
    const subject = "Welcome to Banking System!";
    const text = `Hi ${name},\n\nThank you for registering with our Banking System. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nBanking System Team`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering with our <strong>Banking System</strong>. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br/>Banking System Team</p>`;
    await sendEmail(userEmail, subject, text, html);    
}

async function sendTransactionEmail(userEmail, name, amount, toAccount, transactionDetails){
    const subject = "Transaction Notification";
    const text = `Hi ${name},\n\nA transaction of $${amount} has been processed successfully.\n\nTransaction Details:\n${transactionDetails}\n\nBest regards,\nBanking System Team`;
    const html = `<p>Hi ${name},</p><p>A transaction of <strong>$${amount}</strong> has been processed successfully.</p><p><strong>Transaction Details:</strong></p><pre>${transactionDetails}</pre><p>Best regards,<br/>Banking System Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount, transactionDetails){
    const subject = "Transaction Failure Notification";
    const text = `Hi ${name},\n\nWe regret to inform you that a transaction of $${amount} to account ${toAccount} has failed.\n\nTransaction Details:\n${transactionDetails}\n\nPlease check your account and try again. If you have any questions, feel free to contact our support team.\n\nBest regards,\nBanking System Team`;
    const html = `<p>Hi ${name},</p><p>We regret to inform you that a transaction of <strong>$${amount}</strong> to account <strong>${toAccount}</strong> has failed.</p><p><strong>Transaction Details:</strong></p><pre>${transactionDetails}</pre><p>Please check your account and try again. If you have any questions, feel free to contact our support team.</p><p>Best regards,<br/>Banking System Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendPasswordResetEmail(userEmail, name, resetLink){
    const subject = "Password Reset Request";
    const text = `Hi ${name},\n\nWe received a request to reset your password. Please click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nBanking System Team`;
    const html = `<p>Hi ${name},</p><p>We received a request to reset your password. Please click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request a password reset, please ignore this email.</p><p>Best regards,<br/>Banking System Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}


module.exports = {  sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail, sendPasswordResetEmail};
