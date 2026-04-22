const express = require('express');
const config = require('./config');
const bonzoWebhookRoute = require('./routes/bonzoWebhook');
const logger = require('./utils/logger');

const app = express();

// Parse JSON webhook bodies.
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'bonzo-monday-sync' });
});

// Requirement: webhook endpoint is /webhooks/bonzo
app.use('/webhooks', bonzoWebhookRoute);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
