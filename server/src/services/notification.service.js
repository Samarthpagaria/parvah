// services/notification.service.js
const { supabaseAdmin } = require('../config/db');

/**
 * sendNotification
 * Writes a notification record to the notifications table.
 * Supabase Realtime will push it to the connected client automatically.
 *
 * Two usage modes:
 *
 * 1) Single recipient:
 *    { recipientId, recipientType, issueId, type, title, message }
 *
 * 2) Broadcast to all org admins (optionally filtered by minRole):
 *    { orgId, issueId, type, title, message, recipientType: 'admin_user', minRole? }
 *
 * @param {Object} params
 */
exports.sendNotification = async ({
    recipientId,
    recipientType,
    orgId,
    issueId,
    type,
    title,
    message,
    minRole,
}) => {
    try {
        let recipients = [];

        if (recipientId) {
            // Single recipient
            recipients = [{ id: recipientId, type: recipientType }];
        } else if (orgId) {
            // Broadcast to org admins
            const ROLE_HIERARCHY = ['staff', 'read', 'edit', 'owner'];
            const minRoleIndex = minRole ? ROLE_HIERARCHY.indexOf(minRole) : 0;

            const { data: members } = await supabaseAdmin
                .from('org_admin_members')
                .select('admin_user_id, role')
                .eq('org_id', orgId)
                .eq('is_active', true);

            recipients = (members || [])
                .filter((m) => ROLE_HIERARCHY.indexOf(m.role) >= minRoleIndex)
                .map((m) => ({ id: m.admin_user_id, type: 'admin_user' }));
        }

        if (recipients.length === 0) return;

        const rows = recipients.map(({ id, type: rType }) => ({
            recipient_id: id,
            recipient_type: rType,
            issue_id: issueId || null,
            type,
            title,
            message,
            is_read: false,
        }));

        const { error } = await supabaseAdmin.from('notifications').insert(rows);

        if (error) {
            console.error('sendNotification insert error:', error);
        }
    } catch (err) {
        // Non-fatal: log but don't crash the request
        console.error('sendNotification unexpected error:', err);
    }
};