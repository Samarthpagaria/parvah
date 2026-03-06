// controllers/ai.controllers.js
const { supabaseAdmin } = require('../config/db');

/**
 * POST /api/ai/chat
 * Provides an AI response based on organization context.
 */
exports.chatWithContext = async (req, res) => {
    try {
        const { orgId, message } = req.body;
        const adminUserId = req.user.id;

        // 1. Verify access
        const { data: membership, error: memError } = await supabaseAdmin
            .from('org_admin_members')
            .select('role')
            .eq('admin_user_id', adminUserId)
            .eq('org_id', orgId)
            .eq('is_active', true)
            .single();

        if (memError || !membership) {
            return res.status(403).json({ error: 'Access denied to this organization.' });
        }

        // 2. Fetch context data (minimal for now)
        const { count: totalIssues } = await supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId);

        const { count: openIssues } = await supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('status', 'open');

        // 3. Construct Context (Mocking LLM call for now)
        // In a real scenario, we would use OpenAI or Gemini here

        const response = `Based on the current organization data, there are ${totalIssues} total issues, with ${openIssues} currently open. ${message ? ("You asked: " + message) : ""}`;

        return res.json({
            reply: response,
            context: {
                totalIssues,
                openIssues
            }
        });

    } catch (err) {
        console.error('chatWithContext error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
