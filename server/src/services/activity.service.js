const { supabaseAdmin } = require('../config/db');

/**
 * logActivity
 * Writes an entry to the issue_activity_log table.
 *
 * @param {Object} params
 * @param {string} params.issueId
 * @param {string} params.actorId
 * @param {string} params.actorType - 'admin_user' | 'public_user' | 'system'
 * @param {string} params.action - e.g. 'ISSUE_CREATED', 'STATUS_CHANGED'
 * @param {Object} [params.oldValue]
 * @param {Object} [params.newValue]
 */
exports.logActivity = async ({
  issueId,
  actorId,
  actorType,
  action,
  oldValue = null,
  newValue = null,
  orgId = null,
}) => {
  try {
    let finalOrgId = orgId;

    // If orgId not provided, fetch it from issue to maintain DB rule
    if (!finalOrgId && issueId) {
      const { data: issue } = await supabaseAdmin
        .from('issues')
        .select('org_id')
        .eq('id', issueId)
        .single();
      if (issue) finalOrgId = issue.org_id;
    }

    const { error } = await supabaseAdmin.from('issue_activity_log').insert({
      issue_id: issueId,
      actor_id: actorId,
      actor_type: actorType,
      action,
      old_value: oldValue,
      new_value: newValue,
      org_id: finalOrgId,
    });

    if (error) {
      console.error('logActivity insert error:', error.message);
    }
  } catch (err) {
    console.error('logActivity unexpected error:', err.message);
  }
};
