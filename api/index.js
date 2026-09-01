const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const app = express();
const MAX_PAYLOAD_BYTES = 1024 * 1024;
const logPath = path.join(process.cwd(), 'data.log');

app.use(express.raw({
  type: '*/*',
  limit: MAX_PAYLOAD_BYTES,
}));

app.post('/receive', async (req, res, next) => {
  try {
    const rawPayload = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : JSON.stringify(req.body ?? null);

    const entry = JSON.stringify({
      receivedAt: new Date().toISOString(),
      contentType: req.get('content-type') || null,
      payload: rawPayload,
    }) + '\n';

    await fs.appendFile(logPath, entry, 'utf8');
    res.status(202).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/', (_req, res) => {
  res.type('text').send('Webhook receiver is running.');
});

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: 'Payload exceeds the 1 MiB limit.' });
  }

  console.error(error);
  return res.status(500).json({ ok: false, error: 'Unable to record payload.' });
});

module.exports = app;
