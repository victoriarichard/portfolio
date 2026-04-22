const axios = require('axios');
const config = require('../config');

const mondayClient = axios.create({
  baseURL: config.monday.apiUrl,
  headers: {
    Authorization: config.monday.apiToken,
    'Content-Type': 'application/json'
  }
});

async function runMondayQuery(query, variables = {}) {
  const response = await mondayClient.post('', { query, variables });

  if (response.data.errors) {
    const message = response.data.errors.map((err) => err.message).join('; ');
    throw new Error(`Monday API error: ${message}`);
  }

  return response.data.data;
}

async function findItemByColumnValue(columnId, value) {
  if (!value) return null;

  const query = `
    query ($boardId: ID!, $columnId: String!, $value: String!) {
      items_page_by_column_values(
        board_id: $boardId,
        columns: [{column_id: $columnId, column_values: [$value]}]
      ) {
        items {
          id
          name
        }
      }
    }
  `;

  const data = await runMondayQuery(query, {
    boardId: String(config.monday.boardId),
    columnId,
    value
  });

  return data.items_page_by_column_values?.items?.[0] || null;
}

async function createLeadItem(lead) {
  const query = `
    mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const columnValues = JSON.stringify({
    [config.monday.columns.email]: { email: lead.email, text: lead.email },
    [config.monday.columns.phone]: lead.phone,
    [config.monday.columns.prospectId]: lead.prospectId,
    [config.monday.columns.status]: { label: 'App Scheduled' }
  });

  const data = await runMondayQuery(query, {
    boardId: String(config.monday.boardId),
    itemName: lead.name || lead.email || `Bonzo Lead ${lead.prospectId}`,
    columnValues
  });

  return data.create_item;
}

async function updateLeadItem(itemId, lead) {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
      change_multiple_column_values(
        board_id: $boardId,
        item_id: $itemId,
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const columnValues = JSON.stringify({
    [config.monday.columns.email]: { email: lead.email, text: lead.email },
    [config.monday.columns.phone]: lead.phone,
    [config.monday.columns.prospectId]: lead.prospectId,
    [config.monday.columns.status]: { label: 'App Scheduled' }
  });

  const data = await runMondayQuery(query, {
    boardId: String(config.monday.boardId),
    itemId: String(itemId),
    columnValues
  });

  return data.change_multiple_column_values;
}

/**
 * Matching priority required by the task:
 * 1) Bonzo Prospect ID
 * 2) email
 * 3) create new item if no match
 */
async function upsertLeadByRules(lead) {
  let existing = await findItemByColumnValue(config.monday.columns.prospectId, lead.prospectId);

  if (!existing) {
    existing = await findItemByColumnValue(config.monday.columns.email, lead.email);
  }

  if (existing) {
    const updated = await updateLeadItem(existing.id, lead);
    return { action: 'updated', item: updated };
  }

  const created = await createLeadItem(lead);
  return { action: 'created', item: created };
}

module.exports = {
  upsertLeadByRules
};
