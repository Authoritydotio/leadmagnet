const { isValidLead, forwardLead } = require('./_lib/subscribe');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const body = req.body || {};
  if (!isValidLead(body)) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  try {
    const result = await forwardLead(body, process.env.EMAIL_WEBHOOK_URL || 'https://hook.us2.make.com/grud00y9hpvpd4u8ng0vsk7hdd6di5l6');
    res.status(200).json(result);
  } catch (err) {
    console.error('[subscribe] webhook forward failed', err);
    res.status(502).json({ error: 'webhook_failed' });
  }
};
