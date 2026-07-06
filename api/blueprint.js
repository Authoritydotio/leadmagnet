const { generateBlueprint } = require('./_lib/blueprint');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const p = req.body || {};
  if (!p.profession || !p.rate || !p.hours || !p.goal) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  try {
    const blueprint = await generateBlueprint(p, process.env.ANTHROPIC_API_KEY);
    res.status(200).json(blueprint);
  } catch (err) {
    console.error('[blueprint] generation failed', err);
    if (err.code === 'not_configured') {
      return res.status(500).json({ error: 'not_configured' });
    }
    res.status(502).json({ error: 'generation_failed' });
  }
};
