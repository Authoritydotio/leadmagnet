const path = require('path');
// Load .env by absolute path relative to this file, so the server works
// regardless of the directory it is launched from (cwd-independent).
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const express = require('express');
const { generateBlueprint } = require('../api/_lib/blueprint');
const { isValidLead, forwardLead } = require('../api/_lib/subscribe');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const EMAIL_WEBHOOK_URL = process.env.EMAIL_WEBHOOK_URL || '';
const BOOKING_URL = process.env.BOOKING_URL || 'https://authority.io/apply';

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/config', (req, res) => {
  res.json({ bookingUrl: BOOKING_URL });
});

app.post('/api/subscribe', async (req, res) => {
  const body = req.body || {};
  if (!isValidLead(body)) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  try {
    const result = await forwardLead(body, EMAIL_WEBHOOK_URL);
    res.json(result);
  } catch (err) {
    console.error('[subscribe] webhook forward failed', err);
    res.status(502).json({ error: 'webhook_failed' });
  }
});

app.post('/api/blueprint', async (req, res) => {
  const p = req.body || {};
  if (!p.profession || !p.rate || !p.hours || !p.goal) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  try {
    const blueprint = await generateBlueprint(p, ANTHROPIC_API_KEY);
    res.json(blueprint);
  } catch (err) {
    console.error('[blueprint] generation failed', err);
    if (err.code === 'not_configured') {
      return res.status(500).json({ error: 'not_configured' });
    }
    res.status(502).json({ error: 'generation_failed' });
  }
});

app.listen(PORT, () => {
  console.log('Authority Audit server listening on port ' + PORT);
  if (!ANTHROPIC_API_KEY) console.warn('Warning: ANTHROPIC_API_KEY is not set - blueprint generation will fail.');
  if (!EMAIL_WEBHOOK_URL) console.warn('Warning: EMAIL_WEBHOOK_URL is not set - leads will only be logged.');
});
