import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendConfirmationEmail({ name, email, service, date, time }) {
  await transporter.sendMail({
    from: `"Stellar Web" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Appointment is Confirmed ✅",
    html: `
      <h2>Thanks for booking, ${name}!</h2>
      <p>Your <b>${service}</b> appointment is scheduled for <b>${date}</b> at <b>${time}</b>.</p>
      <p>We'll see you then 🚀</p>
    `
  });
}

export async function sendReminderEmail({ name, email, service, date, time }) {
  await transporter.sendMail({
    from: `"Stellar Web" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Reminder: Your ${service} Appointment`,
    html: `
      <p>Hi ${name},</p>
      <p>This is a friendly reminder that your <strong>${service}</strong> appointment is scheduled for <strong>${date}</strong> at <strong>${time}</strong>.</p>
      <p>See you soon!</p>
    `
  });
}
