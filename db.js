// db.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  service: String,
  date: String,
  time: String,
}, { timestamps: true });

const logSchema = new mongoose.Schema({
  appointmentId: mongoose.Types.ObjectId,
  action: String,
  timestamp: String,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
const Log = mongoose.model('Log', logSchema);

export async function initDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

export function getDB() {
  return mongoose.connection;
}

export async function insertAppointment(name, email, service, date, time) {
  const appointment = new Appointment({ name, email, service, date, time });
  const saved = await appointment.save();
  return saved._id;
}

export async function getAppointments() {
  return await Appointment.find();
}

export async function isSlotTaken(service, date, time) {
  const existing = await Appointment.findOne({ service, date, time });
  return !!existing;
}

export async function updateAppointment(id, name, service, date, time) {
  await Appointment.findByIdAndUpdate(id, { name, service, date, time });
}

export async function deleteAppointment(id) {
  await Appointment.findByIdAndDelete(id);
}

export async function logAction(action, appointmentId) {
  const log = new Log({
    appointmentId,
    action,
    timestamp: new Date().toISOString()
  });
  await log.save();
}

export async function getLogs() {
  return await Log.find();
}