// middleware/requireRole.js
const { supabaseAdmin } = require('../config/db');

/**
 * requireRole
 * Checks if the authenticated admin has one of the required roles
 * within the organization specified in req.params.orgId OR
 * within the org of the issue (fetched by issueId).
 *
 * Must be used AFTER authenticate + requireAdmin middleware.
 *
 * Usage:
 *   router.put('/route', authenticate, requireAdmin, requireRole(['owner', 'edit']), controller)
 *
 * @param {string[]} allowedRoles - e.g. ['owner', 'edit']
 */
exports.requireRole = (allowedRoles) => async (req, res, next) => {
    try {
        const userId = req.user?.id;

        // Super admins bypass role checks
        if (req.adminUser?.is_super_admin) return next();

        // Determine orgId: from params directly, or from the issue
        let orgId = req.params.orgId;

        if (!orgId && req.params.issueId) {
            const { data: issue } = await supabaseAdmin
                .from('issues')
                .select('org_id')
                .eq('id', req.params.issueId)
                .single();
            orgId = issue?.org_id;
        }

        if (!orgId) {
            return res.status(400).json({ error: 'Unable to determine organization context.' });
        }

        const { data: member, error } = await supabaseAdmin
            .from('org_admin_members')
            .select('role')
            .eq('admin_user_id', userId)
            .eq('org_id', orgId)
            .eq('is_active', true)
            .single();

        if (error || !member) {
            return res.status(403).json({ error: 'You are not a member of this organization.' });
        }

        console.log(`[ROLE CHECK] admin_user_id=${userId} | org_id=${orgId} | member_role=${member?.role ?? 'none'} | required=${allowedRoles.join('|')}`);

        if (!allowedRoles.includes(member.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${member.role}`,
            });
        }

        req.memberRole = member.role;
        next();
    } catch (err) {
        console.error('requireRole middleware error:', err);
        return res.status(500).json({ error: 'Role authorization check failed.' });
    }
};