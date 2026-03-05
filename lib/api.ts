/**
 * 🚀 CivicTrack Frontend API Utility
 * Refactored from utils/backennd_api_endpoints.js to TypeScript
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isServer = typeof window === 'undefined';
    const token = !isServer ? localStorage.getItem('parvah_token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
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

    return data as T;
}

export const authAPI = {
    loginAdmin: (email: string, password: string): Promise<any> =>
        apiFetch('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    loginPublic: (email: string, password: string): Promise<any> =>
        apiFetch('/auth/public/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    registerPublic: (userData: any): Promise<any> =>
        apiFetch('/auth/public/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    registerAdmin: (email: string, password: string, fullName: string): Promise<any> =>
        apiFetch('/auth/admin/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name: fullName }),
        }),

    getMe: (): Promise<any> => apiFetch('/auth/me'),

    updateProfile: (profileData: any): Promise<any> =>
        apiFetch('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),

    logout: (): Promise<any> => apiFetch('/auth/logout', { method: 'POST' }),
};

export const orgAPI = {
    listAll: () => apiFetch('/organizations'),
    listMy: () => apiFetch('/organizations/my'),
    create: (orgData: any) => apiFetch('/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData),
    }),
    getDetails: (orgId: string) => apiFetch(`/organizations/${orgId}`),
    update: (orgId: string, orgData: any) => apiFetch(`/organizations/${orgId}`, {
        method: 'PUT',
        body: JSON.stringify(orgData),
    }),
    deactivate: (orgId: string) => apiFetch(`/organizations/${orgId}`, {
        method: 'DELETE',
    }),
    listMembers: (orgId: string) => apiFetch(`/organizations/${orgId}/members`),
    removeMember: (orgId: string, memberId: string) => apiFetch(`/organizations/${orgId}/members/${memberId}`, {
        method: 'DELETE',
    }),
};

export const inviteAPI = {
    send: (orgId: string, email: string, role: string) => apiFetch('/invitations', {
        method: 'POST',
        body: JSON.stringify({ org_id: orgId, invitee_email: email, role }),
    }),
    listPending: (orgId: string) => apiFetch(`/invitations/${orgId}`),
    revoke: (inviteId: string) => apiFetch(`/invitations/${inviteId}`, {
        method: 'DELETE',
    }),
    verifyToken: (token: string) => apiFetch(`/invitations/verify/${token}`),
    accept: (token: string, fullName: string, password: string) => apiFetch('/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token, full_name: fullName, password }),
    }),
};

export const issueAPI = {
    list: () => apiFetch('/issues'),
    report: (issueData: any) => apiFetch('/issues', {
        method: 'POST',
        body: JSON.stringify(issueData),
    }),
    getDetails: (issueId: string) => apiFetch(`/issues/${issueId}`),
    upvote: (issueId: string) => apiFetch(`/issues/${issueId}/upvote`, {
        method: 'POST',
    }),
    updateStatus: (issueId: string, status: string) => apiFetch(`/issues/${issueId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    }),
    assignStaff: (issueId: string, staffId: string) => apiFetch(`/issues/${issueId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ admin_user_id: staffId }),
    }),
};

export const analyticsAPI = {
    getOverview: (orgId: string) => apiFetch(`/analytics/overview/${orgId}`),
    getTrends: (orgId: string) => apiFetch(`/analytics/trends/${orgId}`),
    getByCategory: (orgId: string) => apiFetch(`/analytics/by-category/${orgId}`),
};
