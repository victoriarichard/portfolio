const express = require('express');
const config = require('../config');
const { mapBonzoLead } = require('../utils/leadMapper');
const mondayService = require('../services/mondayService');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/bonzo', async (req, res) => {
  try {
    // Optional lightweight webhook secret check.
    // If BONZO_WEBHOOK_SECRET is set, Bonzo should send the same value
    // in the x-bonzo-secret header.
    if (config.bonzoWebhookSecret) {
      const providedSecret = req.headers['x-bonzo-secret'];
      if (providedSecret !== config.bonzoWebhookSecret) {
        return res.status(401).json({ ok: false, message: 'Invalid webhook secret' });
      }
    }

    const lead = mapBonzoLead(req.body);

    // Requirement: only process stage exactly "Appt Scheduled"
    if (lead.stage !== 'Appt Scheduled') {
      logger.info('Ignoring lead because stage is not Appt Scheduled', {
        prospectId: lead.prospectId,
        stage: lead.stage
      });
      return res.status(200).json({
        ok: true,
        ignored: true,
        reason: 'Lead stage is not Appt Scheduled'
      });
    }

    const result = await mondayService.upsertLeadByRules(lead);

    logger.info('Lead synced to Monday', {
      action: result.action,
      prospectId: lead.prospectId,
      email: lead.email
    });

    return res.status(200).json({ ok: true, action: result.action, lead });
  } catch (err) {
    logger.error('Failed to process Bonzo webhook', err.message);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
