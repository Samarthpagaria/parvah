const { supabaseAdmin } = require('../config/db');

/**
 * Helper to check if a user is an admin of an organization.
 */
async function verifyOrgAdmin(adminUserId, orgId) {
    const { data, error } = await supabaseAdmin
        .from('org_admin_members')
        .select('role')
        .eq('admin_user_id', adminUserId)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .single();

    if (error || !data) return null;
    return data;
}

// GET /api/categories/:orgId
exports.getCategories = async (req, res) => {
    try {
        const { orgId } = req.params;
        const userId = req.user.id;

        const member = await verifyOrgAdmin(userId, orgId);
        if (!member) {
            return res.status(403).json({ error: 'Access denied to this organization.' });
        }

        const { data: categories, error } = await supabaseAdmin
            .from('issue_categories')
            .select('*')
            .eq('org_id', orgId)
            .order('name', { ascending: true });

        if (error) throw error;

        // Optionally fetch issue counts for each category
        const { data: counts, error: countErr } = await supabaseAdmin
            .from('issues')
            .select('category_id')
            .eq('org_id', orgId);

        if (!countErr && counts) {
            const countMap = counts.reduce((acc, issue) => {
                if (issue.category_id) {
                    acc[issue.category_id] = (acc[issue.category_id] || 0) + 1;
                }
                return acc;
            }, {});

            categories.forEach(cat => {
                cat.issueCount = countMap[cat.id] || 0;
            });
        }

        return res.status(200).json({ categories });
    } catch (err) {
        console.error('getCategories error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// POST /api/categories/:orgId
exports.createCategory = async (req, res) => {
    try {
        const { orgId } = req.params;
        const userId = req.user.id;
        const { name, color, description, icon } = req.body;

        if (!name) return res.status(400).json({ error: 'Category name is required.' });

        const member = await verifyOrgAdmin(userId, orgId);
        if (!member || !['owner', 'admin', 'edit'].includes(member.role)) {
            return res.status(403).json({ error: 'Access denied or insufficient permissions.' });
        }

        const { data: category, error } = await supabaseAdmin
            .from('issue_categories')
            .insert({
                org_id: orgId,
                name,
                color: color || '#10b981',
                description: description || null,
                icon: icon || null
            })
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({ category });
    } catch (err) {
        console.error('createCategory error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// DELETE /api/categories/:orgId/:categoryId
exports.deleteCategory = async (req, res) => {
    try {
        const { orgId, categoryId } = req.params;
        const userId = req.user.id;

        const member = await verifyOrgAdmin(userId, orgId);
        if (!member || !['owner', 'admin'].includes(member.role)) {
            return res.status(403).json({ error: 'Access denied or insufficient permissions.' });
        }

        // Check if category is in use
        const { count, error: checkErr } = await supabaseAdmin
            .from('issues')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', categoryId);

        if (count > 0) {
            return res.status(400).json({ error: 'Cannot delete category that is currently in use by issues.' });
        }

        const { error } = await supabaseAdmin
            .from('issue_categories')
            .delete()
            .eq('id', categoryId)
            .eq('org_id', orgId);

        if (error) throw error;

        return res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (err) {
        console.error('deleteCategory error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
