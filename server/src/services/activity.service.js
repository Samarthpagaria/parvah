const { supabaseAdmin } = require("../config/db");

/**
 * Logs an action performed on an issue to the issue_activity_log table.
 * @param {Object} params
 * @param {string} params.issueId
 * @param {string} params.actorId
 * @param {string} params.actorType - 'admin_user' | 'public_user'
 * @param {string} params.action
 * @param {Object} [params.oldValue]
 * @param {Object} [params.newValue]
 * @param {string} [params.orgId]
 */
exports.logActivity = async ({
  issueId,
  actorId,
  actorType,
  action,
  oldValue,
  newValue,
  orgId,
}) => {
  try {
    const { error } = await supabaseAdmin.from("issue_activity_log").insert({
      issue_id: issueId,
      actor_id: actorId,
      actor_type: actorType,
      action,
      old_value: oldValue || null,
      new_value: newValue || null,
      org_id: orgId || null,
    });

    if (error) {
      console.error(
        "[Activity Log Error] Failed to insert log:",
        error.message,
      );
    }
  } catch (err) {
    console.error("[Activity Log Error]:", err.message);
  }
};
