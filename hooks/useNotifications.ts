// hooks/useNotifications.ts
// Handles:
//   1. Fetching notifications from the Express backend on mount
//   2. Supabase Realtime subscription for live bell updates
//   3. Exposing actions (markAsRead, markAllAsRead, deleteOne, clearAll)

'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import api from '@/lib/api';
import {
  useNotificationStore,
  Notification,
} from '@/store/notificationStore';

export const useNotifications = (userId: string | null) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    setNotifications,
    setUnreadCount,
    setLoading,
    addNotification,
    markOneAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore();

  // ── 1. Initial fetch on mount ─────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/notifications?limit=30');
      setNotifications(data.data);
    } catch (err) {
      console.error('[useNotifications] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, setNotifications, setLoading]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── 2. Supabase Realtime subscription ─────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload: { new: Notification }) => {
          // New notification arrived — prepend to store + increment badge
          addNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addNotification]);

  // ── 3. Actions ────────────────────────────────────────────────────────────

  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic update
      markOneAsRead(id);
      try {
        await api.put(`/api/notifications/${id}/read`);
      } catch (err) {
        console.error('[useNotifications] markAsRead failed:', err);
        // Re-fetch to reconcile if optimistic update was wrong
        fetchNotifications();
      }
    },
    [markOneAsRead, fetchNotifications]
  );

  const markAllRead = useCallback(async () => {
    // Optimistic update
    markAllAsRead();
    try {
      await api.put('/api/notifications/read-all');
    } catch (err) {
      console.error('[useNotifications] markAllRead failed:', err);
      fetchNotifications();
    }
  }, [markAllAsRead, fetchNotifications]);

  const deleteNotification = useCallback(
    async (id: string) => {
      // Optimistic update
      removeNotification(id);
      try {
        await api.delete(`/api/notifications/${id}`);
      } catch (err) {
        console.error('[useNotifications] delete failed:', err);
        fetchNotifications();
      }
    },
    [removeNotification, fetchNotifications]
  );

  const clearAllNotifications = useCallback(async () => {
    // Optimistic update
    clearAll();
    try {
      await api.delete('/api/notifications');
    } catch (err) {
      console.error('[useNotifications] clearAll failed:', err);
      fetchNotifications();
    }
  }, [clearAll, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAllNotifications,
    refetch: fetchNotifications,
  };
};
