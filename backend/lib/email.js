const nodemailer = require('nodemailer');

const config = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

let transporter = null;
if (config.auth.user && config.auth.pass) {
  transporter = nodemailer.createTransport(config);
} else {
  console.warn('[email] SMTP credentials not set. Email notifications will be logged to console only.');
}

async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || '"ClearMind Clinic" <no-reply@clearmind.com>';
  if (!transporter) {
    console.log(`\n--- [EMAIL MOCK] ---\nFrom: ${from}\nTo: ${to}\nSubject: ${subject}\nBody:\n${text || html}\n--------------------\n`);
    return { mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    console.log(`[email] Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[email] Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

module.exports = { sendMail };
