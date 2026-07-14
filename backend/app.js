require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const psychologistRoutes = require('./routes/psychologist');
const psychometricianRoutes = require('./routes/psychometrician');
const notificationRoutes = require('./routes/notifications');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    allowedOrigins,
  });
});

app.get('/api/cron/reminders', async (req, res, next) => {
  try {
    const { sendMail } = require('./lib/email');
    const now = new Date();
    const twentyThreeHoursLater = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let appts = [];
    let useFallback = false;

    // Defensive check: Query with reminder_sent
    const { data, error } = await supabase
      .from('appointments')
      .select('id, starts_at, session_type, location, notes, reminder_sent, patients(first_name, last_name, caregiver_id)')
      .gte('starts_at', now.toISOString())
      .lte('starts_at', twentyFourHoursLater.toISOString())
      .eq('status', 'scheduled');

    if (error && error.message.includes('reminder_sent')) {
      // Fallback: If database column does not exist yet, use time-window fallback [23h, 24h]
      useFallback = true;
      const { data: fbData, error: fbErr } = await supabase
        .from('appointments')
        .select('id, starts_at, session_type, location, notes, patients(first_name, last_name, caregiver_id)')
        .gte('starts_at', twentyThreeHoursLater.toISOString())
        .lte('starts_at', twentyFourHoursLater.toISOString())
        .eq('status', 'scheduled');

      if (fbErr) return res.status(400).json({ error: fbErr.message });
      appts = fbData || [];
    } else if (error) {
      return res.status(400).json({ error: error.message });
    } else {
      appts = (data || []).filter((a) => !a.reminder_sent);
    }

    let sentCount = 0;
    for (const appt of appts) {
      const pt = appt.patients;
      if (!pt || !pt.caregiver_id) continue;

      const { data: parent } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', pt.caregiver_id)
        .maybeSingle();

      if (parent && parent.email) {
        const starts = new Date(appt.starts_at);
        const when = starts.toLocaleString('en-PH', {
          timeZone: 'Asia/Manila',
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });

        const studentName = `${pt.first_name} ${pt.last_name}`;
        await sendMail({
          to: parent.email,
          subject: `Reminder: Appointment Tomorrow for ${studentName} - ClearMind Clinic`,
          text: `Dear ${parent.display_name},\n\nThis is a friendly reminder that ${studentName} has a scheduled session tomorrow.\n\nSession Details:\nDate & Time: ${when}\nLocation: ${appt.location || 'ClearMind Clinic'}\nSession Type: ${appt.session_type}\nNotes: ${appt.notes || 'None'}\n\nIf you have any questions or need to reschedule, please contact the clinic.\n\nBest regards,\nClearMind Psychological Services`,
        }).catch((e) => console.error(`[cron-email] failed to send reminder to ${parent.email}:`, e.message));

        if (!useFallback) {
          await supabase
            .from('appointments')
            .update({ reminder_sent: true })
            .eq('id', appt.id)
            .catch(() => {});
        }
        sentCount++;
      }
    }

    res.json({ ok: true, reminders_sent: sentCount, mode: useFallback ? 'fallback' : 'standard' });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/psychologist', psychologistRoutes);
app.use('/api/psychometrician', psychometricianRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
