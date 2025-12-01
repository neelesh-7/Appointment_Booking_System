import dotenv from 'dotenv';
import { getLogs } from './db.js';
dotenv.config();

import cron from 'node-cron';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import {
  insertAppointment,
  deleteAppointment,
  updateAppointment,
  isSlotTaken,
  getAppointments,
  logAction,
  initDB,
  getDB
} from './db.js';

import {
  sendConfirmationEmail,
  sendReminderEmail
} from './email.js';

await initDB();
const db = getDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 🔐 Admin login check (x-logged-in header)
function isAuthorized(req, res, next) {
  const loggedIn = req.headers['x-logged-in'];
  if (loggedIn === 'true') {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// 🟢 Create new appointment
app.post('/api/appointments', async (req, res) => {
  const { name, email, service, date, time } = req.body;

  try {
    const slotTaken = await isSlotTaken(service, date, time);
    if (slotTaken) {
      return res.status(409).json({ error: 'Slot already booked' });
    }

    const appointmentId = await insertAppointment(name, email, service, date, time);
    console.log(`Appointment saved with ID: ${appointmentId}`);


    try {
      await sendConfirmationEmail({ email, name, service, date, time });
      console.log('Confirmation email sent successfully.');
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    res.json({ success: true, appointmentId });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 🟡 Update appointment
app.put('/api/appointments/:id', async (req, res) => {
  const { name, service, date, time } = req.body;
  await updateAppointment(req.params.id, name, service, date, time);
  await logAction('edit', req.params.id);
  res.sendStatus(200);
});

// 🔴 Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
  await deleteAppointment(req.params.id);
  await logAction('delete', req.params.id);
  res.sendStatus(200);
});

// 🕓 Cron job for 24-hour reminders
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running hourly reminder check...');
  const now = new Date();
  const appointments = await getAppointments();

  for (const app of appointments) {
    const appointmentTime = new Date(`${app.date}T${app.time}`);
    const hoursUntil = (appointmentTime - now) / 1000 / 3600;
    if (hoursUntil > 23.9 && hoursUntil < 24.1) {
      console.log(`📧 Sending reminder to ${app.email} for ${appointmentTime}`);
      await sendReminderEmail(app);
    }
  }
});

// 🔐 Protected: View all appointments
app.get('/api/appointments', isAuthorized, async (req, res) => {
  const rows = await getAppointments();
  res.json(rows);
});

// 🔐 Protected: View booking history/logs
app.get('/api/logs', isAuthorized, async (req, res) => {
  const logs = await getLogs();
  res.json(logs);
});

// 🔐 Admin login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ message: 'Logged in' });
  } else {
    res.status(401).json({ message: 'Incorrect password' });
  }
});

// 🟢 Public route: return booked slots without personal info
app.get('/api/public-appointments', async (req, res) => {
  const rows = await getAppointments();
  const publicView = rows.map(({ service, date, time }) => ({
    service, date, time
  }));
  res.json(publicView);
});

// Public route: return booked slots without personal info
app.get('/api/appointments/public', async (req, res) => {
  const rows = await getAppointments();
  // Return anonymized data: only service, date, and time
  const publicView = rows.map(({ service, date, time }) => ({
    service,
    date,
    time
  }));
  res.json(publicView);
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
