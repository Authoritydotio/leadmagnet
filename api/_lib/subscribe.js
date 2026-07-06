function isValidLead(body) {
  return !!(body && body.firstName && body.email && /\S+@\S+\.\S+/.test(body.email));
}

async function forwardLead(body, webhookUrl) {
  const {
    firstName, email, profession, ceiling, goal, gap,
    leverageScore, timeLockedPct, hoursNeeded, worthPerHr, reclaimHrs,
  } = body;

  if (!webhookUrl) {
    console.warn('[subscribe] EMAIL_WEBHOOK_URL not configured - logging lead instead of forwarding.', { firstName, email, profession });
    return { ok: true, forwarded: false };
  }

  const webhookRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName, email, profession, ceiling, goal, gap,
      leverageScore, timeLockedPct, hoursNeeded, worthPerHr, reclaimHrs,
    }),
  });
  return { ok: true, forwarded: true, webhookStatus: webhookRes.status };
}

module.exports = { isValidLead, forwardLead };
