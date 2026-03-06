// store/notificationStore.ts
// Global Zustand store for notifications.
// Keeps the unread count and notification list in sync across
// NotificationBell, notification page, and Supabase Realtime events.

import { create } from 'zustand';

export type RecipientType = 'public_user' | 'admin_user';

export interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: RecipientType;
  issue_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Setters — called by useNotifications hook
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;

  // Granular updaters — called by Realtime events and API responses
  addNotification: (notification: Notification) => void;
  markOneAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  setLoading: (isLoading) => set({ isLoading }),

  // Called by Supabase Realtime when a new notification arrives
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
    })),

  markOneAsRead: (id) =>
    set((state) => {
      const wasUnread = state.notifications.find(
        (n) => n.id === id && !n.is_read
      );
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const removed = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: removed && !removed.is_read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
