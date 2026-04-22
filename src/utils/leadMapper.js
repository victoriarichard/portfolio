/**
 * Extract a lead from a Bonzo webhook payload.
 * Bonzo payloads can vary by event type, so we check a few likely paths.
 */
function mapBonzoLead(payload = {}) {
  const prospect = payload.prospect || payload.lead || payload.data?.prospect || payload.data || payload;

  return {
    prospectId: String(
      prospect.prospect_id ||
        prospect.id ||
        prospect.prospectId ||
        ''
    ).trim(),
    name: (prospect.name || prospect.full_name || `${prospect.first_name || ''} ${prospect.last_name || ''}`).trim(),
    email: (prospect.email || '').trim().toLowerCase(),
    phone: (prospect.phone || prospect.mobile || '').trim(),
    stage: (
      prospect.pipeline_stage ||
      prospect.stage ||
      payload.pipeline_stage ||
      payload.stage ||
      payload.data?.pipeline_stage ||
      ''
    ).trim()
  };
}

module.exports = {
  mapBonzoLead
};
