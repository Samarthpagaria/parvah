// controllers/issues.controller.js
const { supabaseAdmin } = require('../config/db');
const { logActivity } = require('../services/activity.service');
const { sendNotification } = require('../services/notification.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check if the user is an admin belonging to the given org.
 * Returns the member record (with role) or null.
 */
async function getAdminOrgMember(adminUserId, orgId) {
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

/**
 * Check if user is in the public_users table (i.e., a public user).
 */
async function isPublicUser(userId) {
    const { data } = await supabaseAdmin
        .from('public_users')
        .select('id')
        .eq('id', userId)
        .single();
    return !!data;
}

/**
 * Check if user is in the admin_users table.
 */
async function isAdminUser(userId) {
    const { data } = await supabaseAdmin
        .from('admin_users')
        .select('id, is_super_admin')
        .eq('id', userId)
        .single();
    return data || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/issues
// Admin  → all issues for their org(s), with filters & pagination
// Public → only their own submitted issues
// Query params: status, priority, category_id, assigned_to,
//               org_id, page (default 1), limit (default 20),
//               sort (created_at|updated_at), order (asc|desc)
// ─────────────────────────────────────────────────────────────────────────────
exports.getIssues = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            status,
            priority,
            category_id,
            assigned_to,
            org_id,
            page = 1,
            limit = 20,
            sort = 'created_at',
            order = 'desc',
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const adminUser = await isAdminUser(userId);

        let query = supabaseAdmin
            .from('issues')
            .select(
                `id, title, status, priority, created_at, updated_at, upvotes, is_public,
         address, resolved_at,
         issue_categories(id, name, color, icon),
         public_users!reported_by(id, full_name, email),
         admin_users!assigned_to(id, full_name, email, avatar_url)`,
                { count: 'exact' }
            );

        if (adminUser) {
            // Admin: fetch issues from orgs they belong to
            const { data: memberships } = await supabaseAdmin
                .from('org_admin_members')
                .select('org_id')
                .eq('admin_user_id', userId)
                .eq('is_active', true);

            const orgIds = (memberships || []).map((m) => m.org_id);

            if (org_id) {
                // Verify they belong to the requested org
                if (!orgIds.includes(org_id)) {
                    return res.status(403).json({ error: 'Access denied to this organization.' });
                }
                query = query.eq('org_id', org_id);
            } else {
                query = query.in('org_id', orgIds);
            }
        } else {
            // Public user: only their own issues
            query = query.eq('reported_by', userId);
        }

        // Apply filters
        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (category_id) query = query.eq('category_id', category_id);
        if (assigned_to) query = query.eq('assigned_to', assigned_to);

        // Sorting & pagination
        const allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'upvotes'];
        const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
        query = query
            .order(sortField, { ascending: order === 'asc' })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: issues, error, count } = await query;
        if (error) throw error;

        return res.json({
            issues: issues || [],
            pagination: {
                total: count || 0,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil((count || 0) / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('getIssues error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/issues
// Public User only — submit a new issue report
// Body: { org_id, category_id?, title, description, priority?,
//         latitude?, longitude?, address?, is_public? }
// ─────────────────────────────────────────────────────────────────────────────
exports.createIssue = async (req, res) => {
    try {
        const userId = req.user.id;

        // Only public users can submit issues
        const pubUser = await isPublicUser(userId);
        if (!pubUser) {
            return res.status(403).json({ error: 'Only public users can submit issues.' });
        }

        let {
            org_id,
            category_id,
            title,
            description,
            priority = 'medium',
            latitude,
            longitude,
            address,
            is_public = true,
        } = req.body;

        if (!org_id) {
            const { data: orgs } = await supabaseAdmin.from('organizations').select('id').limit(1);
            if (orgs && orgs.length > 0) {
                org_id = orgs[0].id;
            } else {
                return res.status(400).json({ error: 'org_id is required and no default organization exists.' });
            }
        }
        if (!title || title.length < 5)
            return res.status(400).json({ error: 'Title must be at least 5 characters.' });
        if (!description || description.length < 10)
            return res.status(400).json({ error: 'Description must be at least 10 characters.' });

        // Map category string to ID if needed
        let resolvedCategoryId = null;
        if (category_id) {
            const { data: cat } = await supabaseAdmin.from('issue_categories').select('id').or(`id.eq.${category_id},name.eq.${category_id}`).single();
            if (cat) {
                resolvedCategoryId = cat.id;
            } else if (category_id.length > 3) {
                // If it looks like a name, create it
                const { data: newCat } = await supabaseAdmin.from('issue_categories').insert({ name: category_id }).select().single();
                if (newCat) resolvedCategoryId = newCat.id;
            }
        }

        const { data: issue, error } = await supabaseAdmin
            .from('issues')
            .insert({
                org_id,
                reported_by: userId,
                category_id: resolvedCategoryId,
                title,
                description,
                priority,
                latitude: latitude || null,
                longitude: longitude || null,
                address: address || null,
                is_public,
                status: 'open',
            })
            .select()
            .single();

        if (error) throw error;

        // Log activity
        await logActivity({
            issueId: issue.id,
            actorId: userId,
            actorType: 'public_user',
            action: 'ISSUE_CREATED',
            newValue: { status: 'open', priority },
        });

        // Notify org admins
        await sendNotification({
            orgId: org_id,
            issueId: issue.id,
            type: 'NEW_ISSUE',
            title: 'New Issue Submitted',
            message: `A new issue "${title}" has been submitted.`,
            recipientType: 'admin_user',
        });

        return res.status(201).json({ issue });
    } catch (err) {
        console.error('createIssue error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/issues/:issueId
// Reporter (own issue) or any Admin in the same org
// ─────────────────────────────────────────────────────────────────────────────
exports.getIssueById = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;

        const { data: issue, error } = await supabaseAdmin
            .from('issues')
            .select(
                `*, 
         issue_categories(id, name, color, icon),
         public_users!reported_by(id, full_name, email, avatar_url),
         admin_users!assigned_to(id, full_name, email, avatar_url),
         organizations(id, name, slug)`
            )
            .eq('id', issueId)
            .single();

        if (error || !issue) {
            return res.status(404).json({ error: 'Issue not found.' });
        }

        // Check access: reporter or org admin
        const isReporter = issue.reported_by === userId;
        const adminMember = await getAdminOrgMember(userId, issue.org_id);

        if (!isReporter && !adminMember) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        return res.json({ issue });
    } catch (err) {
        console.error('getIssueById error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/issues/:issueId
// edit role+ or assigned staff — update general issue fields
// Body: { title?, description?, category_id?, address?,
//         latitude?, longitude?, is_public? }
// ─────────────────────────────────────────────────────────────────────────────
exports.updateIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id, assigned_to, status')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });

        const member = await getAdminOrgMember(userId, issue.org_id);
        const isAssignedStaff = issue.assigned_to === userId && member?.role === 'staff';
        const canEdit = member && ['owner', 'edit'].includes(member.role);

        if (!canEdit && !isAssignedStaff) {
            return res.status(403).json({ error: 'Insufficient permissions to update this issue.' });
        }

        const allowedFields = ['title', 'description', 'category_id', 'address', 'latitude', 'longitude', 'is_public'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update.' });
        }

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from('issues')
            .update(updates)
            .eq('id', issueId)
            .select()
            .single();

        if (updateErr) throw updateErr;

        await logActivity({
            issueId,
            actorId: userId,
            actorType: 'admin_user',
            action: 'ISSUE_UPDATED',
            oldValue: issue,
            newValue: updates,
        });

        return res.json({ issue: updated });
    } catch (err) {
        console.error('updateIssue error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/issues/:issueId/status
// edit role+ or assigned staff
// Body: { status, resolution_note? }
// ─────────────────────────────────────────────────────────────────────────────
exports.updateIssueStatus = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { status, resolution_note } = req.body;
        const userId = req.user.id;

        const VALID_STATUSES = ['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'rejected'];
        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
        }

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id, assigned_to, status, reported_by')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });

        const member = await getAdminOrgMember(userId, issue.org_id);
        const isAssignedStaff = issue.assigned_to === userId && member?.role === 'staff';
        const canEdit = member && ['owner', 'edit'].includes(member.role);

        if (!canEdit && !isAssignedStaff) {
            return res.status(403).json({ error: 'Insufficient permissions to change status.' });
        }

        const updates = { status };
        if (resolution_note) updates.resolution_note = resolution_note;

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from('issues')
            .update(updates)
            .eq('id', issueId)
            .select()
            .single();

        if (updateErr) throw updateErr;

        await logActivity({
            issueId,
            actorId: userId,
            actorType: 'admin_user',
            action: 'STATUS_CHANGED',
            oldValue: { status: issue.status },
            newValue: { status },
        });

        // Notify reporter of status change
        await sendNotification({
            recipientId: issue.reported_by,
            recipientType: 'public_user',
            issueId,
            type: 'STATUS_UPDATE',
            title: 'Your issue status has been updated',
            message: `Issue status changed to "${status}".`,
        });

        return res.json({ issue: updated });
    } catch (err) {
        console.error('updateIssueStatus error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/issues/:issueId/assign
// edit role+ only
// Body: { assigned_to } — UUID of a staff admin_user
// ─────────────────────────────────────────────────────────────────────────────
exports.assignIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { assigned_to } = req.body;
        const userId = req.user.id;

        if (!assigned_to) return res.status(400).json({ error: 'assigned_to is required.' });

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id, assigned_to')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });

        // Verify the assignee is a staff member in the same org
        const { data: assigneeMember } = await supabaseAdmin
            .from('org_admin_members')
            .select('role')
            .eq('admin_user_id', assigned_to)
            .eq('org_id', issue.org_id)
            .eq('is_active', true)
            .single();

        if (!assigneeMember || assigneeMember.role !== 'staff') {
            return res.status(400).json({ error: 'Assignee must be an active staff member of this organization.' });
        }

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from('issues')
            .update({ assigned_to })
            .eq('id', issueId)
            .select()
            .single();

        if (updateErr) throw updateErr;

        await logActivity({
            issueId,
            actorId: userId,
            actorType: 'admin_user',
            action: 'ISSUE_ASSIGNED',
            oldValue: { assigned_to: issue.assigned_to },
            newValue: { assigned_to },
        });

        // Notify the assigned staff member
        await sendNotification({
            recipientId: assigned_to,
            recipientType: 'admin_user',
            issueId,
            type: 'NEW_ASSIGNMENT',
            title: 'Issue assigned to you',
            message: `You have been assigned to issue #${issueId}.`,
        });

        return res.json({ issue: updated });
    } catch (err) {
        console.error('assignIssue error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/issues/:issueId/priority
// edit role+ only
// Body: { priority } — 'low' | 'medium' | 'high' | 'critical'
// ─────────────────────────────────────────────────────────────────────────────
exports.updateIssuePriority = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { priority } = req.body;
        const userId = req.user.id;

        const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
        if (!priority || !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
        }

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id, priority')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from('issues')
            .update({ priority })
            .eq('id', issueId)
            .select()
            .single();

        if (updateErr) throw updateErr;

        await logActivity({
            issueId,
            actorId: userId,
            actorType: 'admin_user',
            action: 'PRIORITY_CHANGED',
            oldValue: { priority: issue.priority },
            newValue: { priority },
        });

        // Alert all edit+ admins if priority is critical
        if (priority === 'critical') {
            await sendNotification({
                orgId: issue.org_id,
                issueId,
                type: 'HIGH_PRIORITY_ISSUE',
                title: 'Critical Priority Issue',
                message: `Issue #${issueId} has been marked as critical priority.`,
                recipientType: 'admin_user',
                minRole: 'edit',
            });
        }

        return res.json({ issue: updated });
    } catch (err) {
        console.error('updateIssuePriority error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/issues/:issueId
// Org Admin / Super Admin — soft-delete (set is_active = false or is_public = false)
// Uses is_public = false as soft-delete since there's no is_deleted column
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });

        const adminUser = await isAdminUser(userId);

        // Allow super admin or org owner
        if (!adminUser) return res.status(403).json({ error: 'Access denied.' });

        if (!adminUser.is_super_admin) {
            const member = await getAdminOrgMember(userId, issue.org_id);
            if (!member || member.role !== 'owner') {
                return res.status(403).json({ error: 'Only org owners or super admins can delete issues.' });
            }
        }

        // Soft-delete: mark as not public and closed
        const { error: updateErr } = await supabaseAdmin
            .from('issues')
            .update({ is_public: false, status: 'closed' })
            .eq('id', issueId);

        if (updateErr) throw updateErr;

        await logActivity({
            issueId,
            actorId: userId,
            actorType: 'admin_user',
            action: 'ISSUE_DELETED',
            newValue: { is_public: false, status: 'closed' },
        });

        return res.json({ message: 'Issue successfully deleted.' });
    } catch (err) {
        console.error('deleteIssue error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/issues/:issueId/upvote
// Public User — upvote an issue (one upvote per user, toggle off not required)
// ─────────────────────────────────────────────────────────────────────────────
exports.upvoteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;

        const pubUser = await isPublicUser(userId);
        if (!pubUser) {
            return res.status(403).json({ error: 'Only public users can upvote issues.' });
        }

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, upvotes, is_public')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });
        if (!issue.is_public) return res.status(403).json({ error: 'This issue is not public.' });

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from('issues')
            .update({ upvotes: issue.upvotes + 1 })
            .eq('id', issueId)
            .select('id, upvotes')
            .single();

        if (updateErr) throw updateErr;

        return res.json({ upvotes: updated.upvotes });
    } catch (err) {
        console.error('upvoteIssue error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/issues/:issueId/activity
// Admin or Reporter — get full audit log for an issue
// ─────────────────────────────────────────────────────────────────────────────
exports.getIssueActivity = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id, reported_by')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });

        const isReporter = issue.reported_by === userId;
        const member = await getAdminOrgMember(userId, issue.org_id);

        if (!isReporter && !member) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const { data: activity, error } = await supabaseAdmin
            .from('issue_activity_log')
            .select('id, actor_id, actor_type, action, old_value, new_value, created_at')
            .eq('issue_id', issueId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ activity: activity || [] });
    } catch (err) {
        console.error('getIssueActivity error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/issues/:issueId/attachments
// Admin or Reporter
// ─────────────────────────────────────────────────────────────────────────────
exports.getAttachments = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id, reported_by')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });

        const isReporter = issue.reported_by === userId;
        const member = await getAdminOrgMember(userId, issue.org_id);

        if (!isReporter && !member) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const { data: attachments, error } = await supabaseAdmin
            .from('issue_attachments')
            .select('id, file_url, file_name, file_type, file_size_kb, created_at, uploader_id')
            .eq('issue_id', issueId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ attachments: attachments || [] });
    } catch (err) {
        console.error('getAttachments error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/issues/:issueId/attachments
// Admin or Reporter — upload a file attachment
// Expects: multipart/form-data with field 'file'
// Uses Supabase Storage — file is uploaded client-side to Storage first,
// then the URL is registered here via { file_url, file_name, file_type, file_size_kb }
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadAttachment = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;
        const { file_url, file_name, file_type, file_size_kb } = req.body;

        if (!file_url || !file_name || !file_type) {
            return res.status(400).json({ error: 'file_url, file_name, and file_type are required.' });
        }

        if (!file_type.startsWith('image/')) {
            return res.status(400).json({ error: 'Only image files are allowed.' });
        }

        if (file_size_kb && file_size_kb > 10240) {
            return res.status(400).json({ error: 'File size must not exceed 10MB (10240 KB).' });
        }

        const { data: issue, error: fetchErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id, reported_by')
            .eq('id', issueId)
            .single();

        if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found.' });

        const isReporter = issue.reported_by === userId;
        const member = await getAdminOrgMember(userId, issue.org_id);

        if (!isReporter && !member) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        // Check attachment count (max 5 per issue as per blueprint)
        const { count } = await supabaseAdmin
            .from('issue_attachments')
            .select('*', { count: 'exact', head: true })
            .eq('issue_id', issueId);

        if (count >= 5) {
            return res.status(400).json({ error: 'Maximum of 5 attachments allowed per issue.' });
        }

        const { data: attachment, error } = await supabaseAdmin
            .from('issue_attachments')
            .insert({
                issue_id: issueId,
                uploader_id: userId,
                file_url,
                file_name,
                file_type,
                file_size_kb: file_size_kb || null,
            })
            .select()
            .single();

        if (error) throw error;

        await logActivity({
            issueId,
            actorId: userId,
            actorType: isReporter ? 'public_user' : 'admin_user',
            action: 'ATTACHMENT_ADDED',
            newValue: { file_name, file_type },
        });

        return res.status(201).json({ attachment });
    } catch (err) {
        console.error('uploadAttachment error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};