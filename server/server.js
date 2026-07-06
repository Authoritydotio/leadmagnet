const path = require('path');
// Load .env by absolute path relative to this file, so the server works
// regardless of the directory it is launched from (cwd-independent).
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const EMAIL_WEBHOOK_URL = process.env.EMAIL_WEBHOOK_URL || '';
const BOOKING_URL = process.env.BOOKING_URL || '#';

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/config', (req, res) => {
  res.json({ bookingUrl: BOOKING_URL });
});

app.post('/api/subscribe', async (req, res) => {
  const {
    firstName, email, profession, ceiling, goal, gap,
    leverageScore, timeLockedPct, hoursNeeded, worthPerHr, reclaimHrs,
  } = req.body || {};

  if (!firstName || !email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  if (!EMAIL_WEBHOOK_URL) {
    console.warn('[subscribe] EMAIL_WEBHOOK_URL not configured - logging lead instead of forwarding.', { firstName, email, profession });
    return res.json({ ok: true, forwarded: false });
  }

  try {
    const webhookRes = await fetch(EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName, email, profession, ceiling, goal, gap,
        leverageScore, timeLockedPct, hoursNeeded, worthPerHr, reclaimHrs,
      }),
    });
    res.json({ ok: true, forwarded: true, webhookStatus: webhookRes.status });
  } catch (err) {
    console.error('[subscribe] webhook forward failed', err);
    res.status(502).json({ error: 'webhook_failed' });
  }
});

function buildPrompt(p) {
  return `You are a business strategist for Authority.io. Model: 4 C's - Curriculum, Coaching,
Community - validated via a one-time live POP (Prototype of Program), then evergreen.

CRITICAL RULES:
- No mention of building a second program
- No mention of keeping 1:1 clients - the program replaces 1:1 work entirely
- No time-bound language
- Program is evergreen after the POP
- No mention of sales calls
- Philosophy: Mastery -> Method -> Mentorship

Value-based pricing: price = 0.5%-5% of (annual cost of problem x years struggling).

Profession: "${p.profession}"
Current rate: $${p.rate}/hr | Weekly hours: ${p.hours} | Ceiling: $${p.ceiling}
Goal: $${p.goal} | Gap: $${p.gap} | Time-locked: ${p.timeLockedPct}%
Hrs needed: ${p.hoursNeeded}/wk | Time worth: $${p.worthPerHr}/hr | Reclaim: ${p.reclaimHrs} hrs/wk

VOICE: Grounded mentor. Every sentence specific to their profession. No hype. No "passive income."

Return ONLY valid JSON, no markdown. Every string value must be a single line - do not include literal line breaks inside any string value.

{
  "headline": "12-15 words specific to profession naming the shift from time-locked to scalable",
  "summary": "2-3 sentences referencing their $${p.worthPerHr}/hr time value and ${p.reclaimHrs} hrs/wk reclaim. Specific to profession.",
  "fourCs": {
    "curriculum": "2 sentences - 1:1 process as curriculum, specific methodology named.",
    "coaching": "2 sentences - group coaching replacing 1:1 entirely.",
    "community": "2 sentences - peer community for their client type.",
    "pop": "2 sentences - one-time live POP before going evergreen. No future programs."
  },
  "assetName": "1-2 sentences - specific scalable asset. No time duration. No 1:1.",
  "clientSize": "e.g. '15-20 founding clients'",
  "weekComparison": {
    "nowSessions": "current weekly 1:1 hours",
    "nowAdmin": "estimated admin hrs/wk",
    "nowMktg": "estimated marketing hrs/wk",
    "nowIncome": "weekly income at ceiling",
    "afterCalls": "group coaching hrs/wk",
    "afterDelivery": "program delivery + async hrs/wk",
    "afterIncome": "estimated weekly program income at scale",
    "afterStop": "Continues earning",
    "note": "2 sentences on weekly shift referencing ${p.reclaimHrs} reclaimed hours."
  },
  "mastery": {"title": "5 words max", "body": "2 sentences on specific expertise."},
  "method": {"title": "5 words max", "body": "2 sentences on 1:1 process becoming curriculum."},
  "mentorship": {"title": "5 words max", "body": "2 sentences on group replacing 1:1."},
  "valuePricing": {
    "problemCost": "Annual cost of client problem - specific dollar estimate.",
    "yearsStruggling": "Typical years struggling.",
    "totalCost": "Range of total lifetime cost.",
    "priceRange": "0.5%-5% value-based range.",
    "recommendedPrice": "Specific recommended POP price.",
    "whyItWorks": "One sentence - outcome value not program length.",
    "pricingNote": "2-3 sentences income math from $${p.ceiling} ceiling to $${p.goal} goal."
  },
  "nextSteps": {
    "title": "A compelling 8-10 word headline for what they do this week - specific to their profession",
    "body": "3-4 sentences: first, one concrete action they can take this week to begin extracting their methodology (specific to their profession, not generic). Then a natural transition into why the next step is speaking with the Authority.io team - frame it as the fastest path from knowing their ceiling to building beyond it. Warm and direct, not salesy."
  }
}`;
}

function sanitizeJsonText(raw) {
  const stripped = raw
    .replace(/```json|```/g, '')
    .trim();
  let noControl = '';
  for (let i = 0; i < stripped.length; i++) {
    const code = stripped.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13) {
      noControl += ' ';
    } else if (code < 32) {
      // drop other control characters
    } else {
      noControl += stripped[i];
    }
  }
  let out = '';
  for (let i = 0; i < noControl.length; i++) {
    const ch = noControl[i];
    if (ch === ',') {
      let j = i + 1;
      while (j < noControl.length && noControl[j] === ' ') j++;
      if (noControl[j] === '}' || noControl[j] === ']') {
        continue;
      }
    }
    out += ch;
  }
  return out;
}

app.post('/api/blueprint', async (req, res) => {
  const p = req.body || {};
  if (!p.profession || !p.rate || !p.hours || !p.goal) {
    return res.status(400).json({ error: 'invalid_input' });
  }
  if (!ANTHROPIC_API_KEY) {
    console.error('[blueprint] ANTHROPIC_API_KEY not configured');
    return res.status(500).json({ error: 'not_configured' });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 4096,
        thinking: { type: 'disabled' },
        messages: [{ role: 'user', content: buildPrompt(p) }],
      }),
    });

    if (!anthropicRes.ok) {
      const text = await anthropicRes.text();
      throw new Error('Anthropic API error ' + anthropicRes.status + ': ' + text);
    }

    const data = await anthropicRes.json();
    const textBlock = (data.content || []).find((b) => b.type === 'text');
    const raw = textBlock && textBlock.text;
    if (!raw) throw new Error('empty response from Anthropic (stop_reason: ' + data.stop_reason + ')');
    const cleaned = sanitizeJsonText(raw);
    let blueprint;
    try {
      blueprint = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[blueprint] raw text was:', cleaned);
      throw parseErr;
    }
    res.json(blueprint);
  } catch (err) {
    console.error('[blueprint] generation failed', err);
    res.status(502).json({ error: 'generation_failed' });
  }
});

app.listen(PORT, () => {
  console.log('Authority Audit server listening on port ' + PORT);
  if (!ANTHROPIC_API_KEY) console.warn('Warning: ANTHROPIC_API_KEY is not set - blueprint generation will fail.');
  if (!EMAIL_WEBHOOK_URL) console.warn('Warning: EMAIL_WEBHOOK_URL is not set - leads will only be logged.');
});
