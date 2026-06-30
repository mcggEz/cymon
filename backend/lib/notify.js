const { supabase } = require('./supabase');

// Insert a notification for one recipient. Best-effort: notifications are a
// secondary effect of an action (booking, sign-off, …), so a failure here must
// never break the primary request — we log and swallow instead of throwing.
async function createNotification({ clinicId, recipientId, type = 'system', title, body = null, link = null }) {
  if (!recipientId || !clinicId || !title) return;
  const { error } = await supabase.from('notifications').insert({
    clinic_id: clinicId,
    recipient_id: recipientId,
    type,
    title,
    body,
    link,
  });
  if (error) console.error('[notify] failed to create notification:', error.message);
}

module.exports = { createNotification };
