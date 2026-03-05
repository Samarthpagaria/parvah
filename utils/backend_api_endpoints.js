/**
 * 🚀 Parvah Frontend API Utility
 * This file contains ready-to-use functions for your React/Next.js frontend.
 * Each function corresponds to an Express backend endpoint.
 */

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/api';

/**
 * Global API Fetch Helper
 * -----------------------
 * Automatically attaches the JWT from localStorage and handles error responses.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('parvah_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ error: 'Response parsing failed' }));

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

/**
 * 🔐 AUTHENTICATION MODULE
 * -------------------------
 */

export const authAPI = {
  // Admin Login
  loginAdmin: async (email, password) => {
    const data = await apiFetch('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('parvah_token', data.token);
      localStorage.setItem('parvah_user_type', 'admin');
    }
    return data;
  },

  // Public User Login
  loginPublic: async (email, password) => {
    const data = await apiFetch('/auth/public/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('parvah_token', data.token);
      localStorage.setItem('parvah_user_type', 'public');
    }
    return data;
  },

  // Public User Register
  registerPublic: (userData) => apiFetch('/auth/public/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // Get Current Profile
  getMe: () => apiFetch('/auth/me'),

  // Update Profile
  updateProfile: (profileData) => apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  // Sign out
  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('parvah_token');
      localStorage.removeItem('parvah_user_type');
    }
  },
};

/**
 * 🏢 ORGANIZATION MODULE
 * -----------------------
 */

export const orgAPI = {
  // List all (Super Admin only)
  listAll: () => apiFetch('/organizations'),

  // Create new (Super Admin only)
  create: (orgData) => apiFetch('/organizations', {
    method: 'POST',
    body: JSON.stringify(orgData),
  }),

  // Get details (id, owner, staff list)
  getDetails: (orgId) => apiFetch(`/organizations/${orgId}`),

  // Update settings
  update: (orgId, orgData) => apiFetch(`/organizations/${orgId}`, {
    method: 'PUT',
    body: JSON.stringify(orgData),
  }),

  // Deactivate (Super Admin only)
  deactivate: (orgId) => apiFetch(`/organizations/${orgId}`, {
    method: 'DELETE',
  }),

  // List members
  listMembers: (orgId) => apiFetch(`/organizations/${orgId}/members`),

  // Remove member
  removeMember: (orgId, memberId) => apiFetch(`/organizations/${orgId}/members/${memberId}`, {
    method: 'DELETE',
  }),
};

/**
 * ✉️ INVITATION MODULE
 * --------------------
 */

export const inviteAPI = {
  // Send invite
  send: (orgId, email, role) => apiFetch('/invitations', {
    method: 'POST',
    body: JSON.stringify({ org_id: orgId, invitee_email: email, role }),
  }),

  // List pending invites
  listPending: (orgId) => apiFetch(`/invitations/${orgId}`),

  // Revoke invite
  revoke: (inviteId) => apiFetch(`/invitations/${inviteId}`, {
    method: 'DELETE',
  }),

  // Verify token (Public page)
  verifyToken: (token) => apiFetch(`/invitations/verify/${token}`),

  // Finalize signup (Public page)
  accept: (token, fullName, password) => apiFetch('/invitations/accept', {
    method: 'POST',
    body: JSON.stringify({ token, full_name: fullName, password }),
  }),
};

/**
 * 🎫 ISSUES MODULE
 * -----------------
 */

export const issueAPI = {
  // Fetch list (filters handled automatically by backend)
  list: () => apiFetch('/issues'),

  // Report new issue
  report: (issueData) => apiFetch('/issues', {
    method: 'POST',
    body: JSON.stringify(issueData),
  }),

  // Get specific issue details
  getDetails: (issueId) => apiFetch(`/issues/${issueId}`),

  // Cast upvote
  upvote: (issueId) => apiFetch(`/issues/${issueId}/upvote`, {
    method: 'POST',
  }),

  // Update status (Staff/Admin)
  updateStatus: (issueId, status) => apiFetch(`/issues/${issueId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  // Assign staff
  assignStaff: (issueId, staffId) => apiFetch(`/issues/${issueId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ admin_user_id: staffId }),
  }),
};

/**
 * 📊 ANALYTICS MODULE
 * -------------------
 */

export const analyticsAPI = {
  getOverview: (orgId) => apiFetch(`/analytics/overview/${orgId}`),
  getTrends: (orgId) => apiFetch(`/analytics/trends/${orgId}`),
  getByCategory: (orgId) => apiFetch(`/analytics/by-category/${orgId}`),
};
