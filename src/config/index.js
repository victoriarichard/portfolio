const dotenv = require('dotenv');

dotenv.config();

/**
 * Centralized app configuration.
 * Keeping config in one place makes beginner projects easier to maintain.
 */
const config = {
  port: process.env.PORT || 3000,
  bonzoWebhookSecret: process.env.BONZO_WEBHOOK_SECRET || '',
  monday: {
    apiUrl: 'https://api.monday.com/v2',
    apiToken: process.env.MONDAY_API_TOKEN,
    boardId: process.env.MONDAY_BOARD_ID,
    columns: {
      name: process.env.MONDAY_NAME_COLUMN_ID || 'name',
      email: process.env.MONDAY_EMAIL_COLUMN_ID || 'email',
      phone: process.env.MONDAY_PHONE_COLUMN_ID || 'phone',
      prospectId: process.env.MONDAY_PROSPECT_ID_COLUMN_ID || 'bonzo_prospect_id',
      status: process.env.MONDAY_STATUS_COLUMN_ID || 'status'
    }
  }
};

module.exports = config;
