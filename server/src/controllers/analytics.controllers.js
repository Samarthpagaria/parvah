// controllers/analytics.controller.js
const { supabaseAdmin } = require('../config/db');

/**
 * Helper — verify the requesting admin belongs to the orgId
 */
async function verifyOrgAccess(adminUserId, orgId) {
    const { data, error } = await supabaseAdmin
        .from('org_admin_members')
        .select('role')
        .eq('admin_user_id', adminUserId)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .single();

    if (error || !data) return false;
    return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/overview/:orgId
// Summary KPI cards: total, open, in_progress, resolved this month,
// avg resolution time (hours), resolution rate (%)
// ─────────────────────────────────────────────────────────────────────────────
exports.getOverview = async (req, res) => {
    try {
        const { orgId } = req.params;
        const adminUserId = req.user.id;

        const hasAccess = await verifyOrgAccess(adminUserId, orgId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this organization.' });
        }

        // Total issues
        const { count: total } = await supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId);

        // Open issues
        const { count: open } = await supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('status', 'open');

        // In Progress issues
        const { count: inProgress } = await supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('status', 'in_progress');

        // Resolved this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { count: resolvedThisMonth } = await supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('status', 'resolved')
            .gte('resolved_at', monthStart.toISOString());

        // Avg resolution time (hours) — raw SQL via rpc
        const { data: resolutionData, error: resError } = await supabaseAdmin.rpc(
            'get_avg_resolution_hours',
            { p_org_id: orgId }
        );

        // Fallback if RPC not available: compute via JS
        let avgResolutionHours = null;
        if (!resError && resolutionData !== null) {
            avgResolutionHours = parseFloat(resolutionData).toFixed(1);
        } else {
            // Alternative: fetch resolved issues and compute manually
            const { data: resolvedIssues } = await supabaseAdmin
                .from('issues')
                .select('created_at, resolved_at')
                .eq('org_id', orgId)
                .eq('status', 'resolved')
                .not('resolved_at', 'is', null);

            if (resolvedIssues && resolvedIssues.length > 0) {
                const totalHours = resolvedIssues.reduce((sum, issue) => {
                    const diff =
                        (new Date(issue.resolved_at) - new Date(issue.created_at)) / (1000 * 60 * 60);
                    return sum + diff;
                }, 0);
                avgResolutionHours = (totalHours / resolvedIssues.length).toFixed(1);
            }
        }

        // Resolution rate
        const { count: totalResolved } = await supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('status', 'resolved');

        const resolutionRate =
            total > 0 ? ((totalResolved / total) * 100).toFixed(1) : '0.0';

        return res.json({
            total: total || 0,
            open: open || 0,
            inProgress: inProgress || 0,
            resolvedThisMonth: resolvedThisMonth || 0,
            totalResolved: totalResolved || 0,
            avgResolutionHours: avgResolutionHours ?? 'N/A',
            resolutionRate: `${resolutionRate}%`,
        });
    } catch (err) {
        console.error('getOverview error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/trends/:orgId
// Query params: period = 'daily' | 'weekly' | 'monthly' (default: daily)
//               start  = ISO date string (default: 30 days ago)
//               end    = ISO date string (default: today)
// Returns: [{ date: 'YYYY-MM-DD', count: number }]
// ─────────────────────────────────────────────────────────────────────────────
exports.getTrends = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { period = 'daily', start, end } = req.query;
        const adminUserId = req.user.id;

        const hasAccess = await verifyOrgAccess(adminUserId, orgId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this organization.' });
        }

        // Determine date range
        const endDate = end ? new Date(end) : new Date();
        const startDate = start
            ? new Date(start)
            : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        endDate.setHours(23, 59, 59, 999);

        // Fetch all issues in the date range
        const { data: issues, error } = await supabaseAdmin
            .from('issues')
            .select('created_at')
            .eq('org_id', orgId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Bucket issues by period
        const buckets = {};

        for (const issue of issues || []) {
            const date = new Date(issue.created_at);
            let key;

            if (period === 'monthly') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (period === 'weekly') {
                // ISO week: get Monday of the week
                const day = date.getDay() || 7;
                const monday = new Date(date);
                monday.setDate(date.getDate() - day + 1);
                key = monday.toISOString().slice(0, 10);
            } else {
                key = date.toISOString().slice(0, 10);
            }

            buckets[key] = (buckets[key] || 0) + 1;
        }

        const trends = Object.entries(buckets)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return res.json({ period, start: startDate.toISOString(), end: endDate.toISOString(), trends });
    } catch (err) {
        console.error('getTrends error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/by-category/:orgId
// Returns: [{ categoryId, categoryName, color, icon, count, resolvedCount }]
// ─────────────────────────────────────────────────────────────────────────────
exports.getByCategory = async (req, res) => {
    try {
        const { orgId } = req.params;
        const adminUserId = req.user.id;

        const hasAccess = await verifyOrgAccess(adminUserId, orgId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this organization.' });
        }

        // Fetch all categories for the org
        const { data: categories, error: catError } = await supabaseAdmin
            .from('issue_categories')
            .select('id, name, color, icon')
            .eq('org_id', orgId)
            .eq('is_active', true);

        if (catError) throw catError;

        // Fetch all issues with their category
        const { data: issues, error: issueError } = await supabaseAdmin
            .from('issues')
            .select('category_id, status')
            .eq('org_id', orgId);

        if (issueError) throw issueError;

        // Build category stats map
        const statsMap = {};
        for (const issue of issues || []) {
            const key = issue.category_id || 'uncategorized';
            if (!statsMap[key]) statsMap[key] = { count: 0, resolvedCount: 0 };
            statsMap[key].count++;
            if (issue.status === 'resolved' || issue.status === 'closed') {
                statsMap[key].resolvedCount++;
            }
        }

        // Merge with category metadata
        const result = (categories || []).map((cat) => ({
            categoryId: cat.id,
            categoryName: cat.name,
            color: cat.color,
            icon: cat.icon,
            count: statsMap[cat.id]?.count || 0,
            resolvedCount: statsMap[cat.id]?.resolvedCount || 0,
        }));

        // Add uncategorized bucket if it exists
        if (statsMap['uncategorized']) {
            result.push({
                categoryId: null,
                categoryName: 'Uncategorized',
                color: '#9CA3AF',
                icon: null,
                count: statsMap['uncategorized'].count,
                resolvedCount: statsMap['uncategorized'].resolvedCount,
            });
        }

        // Sort by count descending
        result.sort((a, b) => b.count - a.count);

        return res.json({ categories: result });
    } catch (err) {
        console.error('getByCategory error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/by-status/:orgId
// Returns: [{ status, count, percentage }]
// ─────────────────────────────────────────────────────────────────────────────
exports.getByStatus = async (req, res) => {
    try {
        const { orgId } = req.params;
        const adminUserId = req.user.id;

        const hasAccess = await verifyOrgAccess(adminUserId, orgId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this organization.' });
        }

        const ALL_STATUSES = ['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'rejected'];

        const { data: issues, error } = await supabaseAdmin
            .from('issues')
            .select('status')
            .eq('org_id', orgId);

        if (error) throw error;

        const total = issues?.length || 0;

        // Count per status
        const statusMap = {};
        for (const issue of issues || []) {
            statusMap[issue.status] = (statusMap[issue.status] || 0) + 1;
        }

        const distribution = ALL_STATUSES.map((status) => {
            const count = statusMap[status] || 0;
            return {
                status,
                count,
                percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
            };
        });

        return res.json({ total, distribution });
    } catch (err) {
        console.error('getByStatus error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/staff-performance/:orgId
// Returns: [{ staffId, fullName, email, avatarUrl,
//             assignedCount, resolvedCount, avgResolutionHours }]
// ─────────────────────────────────────────────────────────────────────────────
exports.getStaffPerformance = async (req, res) => {
    try {
        const { orgId } = req.params;
        const adminUserId = req.user.id;

        const hasAccess = await verifyOrgAccess(adminUserId, orgId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this organization.' });
        }

        // Get all staff members in this org
        const { data: staffMembers, error: staffError } = await supabaseAdmin
            .from('org_admin_members')
            .select('admin_user_id, admin_users(id, full_name, email, avatar_url)')
            .eq('org_id', orgId)
            .eq('role', 'staff')
            .eq('is_active', true);

        if (staffError) throw staffError;

        if (!staffMembers || staffMembers.length === 0) {
            return res.json({ staff: [] });
        }

        const staffIds = staffMembers.map((m) => m.admin_user_id);

        // Fetch issues assigned to staff in this org
        const { data: issues, error: issueError } = await supabaseAdmin
            .from('issues')
            .select('assigned_to, status, created_at, resolved_at')
            .eq('org_id', orgId)
            .in('assigned_to', staffIds);

        if (issueError) throw issueError;

        // Build performance map
        const perfMap = {};
        for (const id of staffIds) {
            perfMap[id] = { assignedCount: 0, resolvedCount: 0, totalResolutionHours: 0 };
        }

        for (const issue of issues || []) {
            const key = issue.assigned_to;
            if (!perfMap[key]) continue;
            perfMap[key].assignedCount++;
            if ((issue.status === 'resolved' || issue.status === 'closed') && issue.resolved_at) {
                perfMap[key].resolvedCount++;
                const hours =
                    (new Date(issue.resolved_at) - new Date(issue.created_at)) / (1000 * 60 * 60);
                perfMap[key].totalResolutionHours += hours;
            }
        }

        const staff = staffMembers.map((member) => {
            const user = member.admin_users;
            const perf = perfMap[member.admin_user_id];
            const avgResolutionHours =
                perf.resolvedCount > 0
                    ? parseFloat((perf.totalResolutionHours / perf.resolvedCount).toFixed(1))
                    : null;

            return {
                staffId: user.id,
                fullName: user.full_name,
                email: user.email,
                avatarUrl: user.avatar_url,
                assignedCount: perf.assignedCount,
                resolvedCount: perf.resolvedCount,
                avgResolutionHours,
            };
        });

        // Sort by resolvedCount descending
        staff.sort((a, b) => b.resolvedCount - a.resolvedCount);

        return res.json({ staff });
    } catch (err) {
        console.error('getStaffPerformance error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/resolution-time/:orgId
// Returns: [{ categoryId, categoryName, avgResolutionHours, resolvedCount }]
// ─────────────────────────────────────────────────────────────────────────────
exports.getResolutionTime = async (req, res) => {
    try {
        const { orgId } = req.params;
        const adminUserId = req.user.id;

        const hasAccess = await verifyOrgAccess(adminUserId, orgId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this organization.' });
        }

        // Fetch categories
        const { data: categories, error: catError } = await supabaseAdmin
            .from('issue_categories')
            .select('id, name, color')
            .eq('org_id', orgId)
            .eq('is_active', true);

        if (catError) throw catError;

        // Fetch resolved issues with timestamps
        const { data: resolvedIssues, error: issueError } = await supabaseAdmin
            .from('issues')
            .select('category_id, created_at, resolved_at')
            .eq('org_id', orgId)
            .in('status', ['resolved', 'closed'])
            .not('resolved_at', 'is', null);

        if (issueError) throw issueError;

        // Build resolution time map per category
        const resMap = {};
        for (const issue of resolvedIssues || []) {
            const key = issue.category_id || 'uncategorized';
            if (!resMap[key]) resMap[key] = { totalHours: 0, count: 0 };
            const hours =
                (new Date(issue.resolved_at) - new Date(issue.created_at)) / (1000 * 60 * 60);
            resMap[key].totalHours += hours;
            resMap[key].count++;
        }

        const result = (categories || []).map((cat) => {
            const stats = resMap[cat.id];
            return {
                categoryId: cat.id,
                categoryName: cat.name,
                color: cat.color,
                resolvedCount: stats?.count || 0,
                avgResolutionHours: stats
                    ? parseFloat((stats.totalHours / stats.count).toFixed(1))
                    : null,
            };
        });

        // Uncategorized bucket
        if (resMap['uncategorized']) {
            const stats = resMap['uncategorized'];
            result.push({
                categoryId: null,
                categoryName: 'Uncategorized',
                color: '#9CA3AF',
                resolvedCount: stats.count,
                avgResolutionHours: parseFloat((stats.totalHours / stats.count).toFixed(1)),
            });
        }

        // Sort by avgResolutionHours ascending (fastest first)
        result.sort((a, b) => {
            if (a.avgResolutionHours === null) return 1;
            if (b.avgResolutionHours === null) return -1;
            return a.avgResolutionHours - b.avgResolutionHours;
        });

        return res.json({ resolutionTime: result });
    } catch (err) {
        console.error('getResolutionTime error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};