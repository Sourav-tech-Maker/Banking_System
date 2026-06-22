const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOtpHtml = (otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f7; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7; padding:40px 0;">
            <tr>
                <td align="center">
                    <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:32px 40px; text-align:center;">
                                <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">
                                    🔐 Email Verification
                                </h1>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:40px;">
                                <p>Hello,</p>

                                <p>
                                    Use the following verification code to complete your registration.
                                    This code is valid for <strong>10 minutes</strong>.
                                </p>

                                <div style="text-align:center; padding:24px 0;">
                                    <div style="display:inline-block; border:2px dashed #667eea; border-radius:12px; padding:20px 48px;">
                                        <span style="font-size:36px; font-weight:800; letter-spacing:12px;">
                                            ${otp}
                                        </span>
                                    </div>
                                </div>

                                <p style="font-size:14px; color:#9a9ea6;">
                                    If you didn't request this code, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="background-color:#f8f9fc; padding:24px; text-align:center;">
                                <p style="margin:0; font-size:12px;">
                                    This is an automated message. Please do not reply.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

const getOtpText = (otp) => {
    return `
Email Verification

Your verification code is: ${otp}

This code is valid for 10 minutes.

If you didn't request this code, you can safely ignore this email.
`;
};

module.exports = {
    generateOtp, getOtpHtml, getOtpText,
};
