// lib/api.ts
// Central Axios instance for all Express backend calls.
// Automatically attaches the Supabase JWT to every request.

import axios from 'axios';
import { createClient } from '@/lib/supabase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach JWT from Supabase session ──────────────────
api.interceptors.request.use(async (config) => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.error('[api.ts] Failed to attach token:', err);
  }
  return config;
});

// ── Response interceptor — handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;