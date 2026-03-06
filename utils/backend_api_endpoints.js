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
  let useType = 'admin';
  if (typeof window !== 'undefined') {
    const isPublic = window.location.pathname.startsWith('/portal') ||
      window.location.pathname.startsWith('/auth/public') ||
      localStorage.getItem('parvah_user_type') === 'public';
    if (isPublic && !window.location.pathname.includes('/admin')) {
      useType = 'public';
    }
  }

  const token = useType === 'admin'
    ? localStorage.getItem('parvah_admin_token')
    : localStorage.getItem('parvah_public_token');

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
    // Collect as much detail as possible for diagnosis
    const errorMsg = data.message || data.details || data.error || 'API request failed';
    const error = new Error(errorMsg);
    // @ts-ignore
    error.details = data.details;
    // @ts-ignore
    error.status = response.status;
    throw error;
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
    localStorage.setItem('parvah_user_type', 'admin');
    const data = await apiFetch('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('parvah_admin_token', data.token);
    }
    return data;
  },

  // Public User Login
  loginPublic: async (email, password) => {
    localStorage.setItem('parvah_user_type', 'public');
    const data = await apiFetch('/auth/public/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('parvah_public_token', data.token);
    }
    return data;
  },

  // Public User Register
  registerPublic: (userData) => {
    localStorage.setItem('parvah_user_type', 'public');
    return apiFetch('/auth/public/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

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
      const type = localStorage.getItem('parvah_user_type');
      if (type === 'admin') localStorage.removeItem('parvah_admin_token');
      else localStorage.removeItem('parvah_public_token');
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

  // Categories
  listCategories: (orgId) => apiFetch(`/organizations/${orgId}/categories`),
  createCategory: (orgId, catData) => apiFetch(`/organizations/${orgId}/categories`, {
    method: 'POST',
    body: JSON.stringify(catData),
  }),
  deleteCategory: (orgId, catId) => apiFetch(`/organizations/${orgId}/categories/${catId}`, {
    method: 'DELETE',
  }),

  // Categories for the current public user's organization (no orgId needed)
  listMyCategories: () => apiFetch('/organizations/categories/mine'),
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
  // Fetch list with optional filters (e.g., { status: 'open', assigned_to: 'uuid' })
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/issues${query ? `?${query}` : ''}`);
  },

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
    body: JSON.stringify({ assigned_to: staffId }),
  }),

  // Get activity log
  getActivity: (issueId) => apiFetch(`/issues/${issueId}/activity`),

  // Get comments
  getComments: (issueId) => apiFetch(`/issues/${issueId}/comments`),
};

/**
 * 📊 ANALYTICS MODULE
 * -------------------
 */

export const analyticsAPI = {
  getOverview: (orgId) => apiFetch(`/analytics/overview/${orgId}`),
  getTrends: (orgId) => apiFetch(`/analytics/trends/${orgId}`),
  getByCategory: (orgId) => apiFetch(`/analytics/by-category/${orgId}`),
  getByStatus: (orgId) => apiFetch(`/analytics/by-status/${orgId}`),
  getStaffPerformance: (orgId) => apiFetch(`/analytics/staff-performance/${orgId}`),
  getResolutionTime: (orgId) => apiFetch(`/analytics/resolution-time/${orgId}`),
};
