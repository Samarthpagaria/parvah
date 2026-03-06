'use client';

// components/common/NotificationBell.tsx
// Drop-in bell icon component for AdminHeader and UserHeader.
// Shows live unread badge, dropdown list, and mark-as-read actions.
//
// Usage:
//   import NotificationBell from '@/components/common/NotificationBell';
//   <NotificationBell userId={user.id} />

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/store/notificationStore';

// ── Icon helpers (inline SVG — no extra dep needed) ──────────────────────────
const BellIcon = ({ hasUnread }: { hasUnread: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 transition-colors ${hasUnread ? 'text-teal-400' : 'text-slate-400'}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
         6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6
         8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6
         0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
         01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0
         00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ── Time helper ───────────────────────────────────────────────────────────────
const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ── Type icon + colour ────────────────────────────────────────────────────────
const typeConfig: Record<string, { emoji: string; dot: string }> = {
  STATUS_UPDATE:   { emoji: '🔄', dot: 'bg-blue-400' },
  NEW_ASSIGNMENT:  { emoji: '📋', dot: 'bg-teal-400' },
  NEW_ISSUE:       { emoji: '📝', dot: 'bg-yellow-400' },
  COMMENT_ADDED:   { emoji: '💬', dot: 'bg-purple-400' },
  ISSUE_RESOLVED:  { emoji: '✅', dot: 'bg-green-400' },
  CRITICAL_ISSUE:  { emoji: '🚨', dot: 'bg-red-400' },
};

// ── Single notification row ───────────────────────────────────────────────────
const NotificationRow = ({
  notification,
  onRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (n: Notification) => void;
}) => {
  const cfg = typeConfig[notification.type] || { emoji: '🔔', dot: 'bg-slate-400' };

  return (
    <div
      className={`relative flex gap-3 px-4 py-3 cursor-pointer transition-colors
        hover:bg-slate-700/50 group
        ${!notification.is_read ? 'bg-slate-700/30' : ''}`}
      onClick={() => {
        if (!notification.is_read) onRead(notification.id);
        onNavigate(notification);
      }}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <span className={`absolute left-2 top-4 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      )}

      {/* Emoji icon */}
      <span className="text-xl mt-0.5 flex-shrink-0">{cfg.emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug truncate
          ${notification.is_read ? 'text-slate-300' : 'text-white font-medium'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-xs text-slate-500 mt-1">{timeAgo(notification.created_at)}</p>
      </div>

      {/* Delete button — visible on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0
          p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 mt-0.5"
        title="Delete"
      >
        <TrashIcon />
      </button>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
interface NotificationBellProps {
  userId: string | null;
  userType?: 'admin_user' | 'public_user';
}

export default function NotificationBell({
  userId,
  userType = 'admin_user',
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications(userId);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavigate = (n: Notification) => {
    setOpen(false);
    if (!n.issue_id) return;
    const base = userType === 'admin_user' ? '/admin/issues' : '/issues';
    router.push(`${base}/${n.issue_id}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon hasUnread={unreadCount > 0} />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
            rounded-full bg-teal-500 text-white text-[10px] font-bold
            flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border
          border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
            border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20
                  text-teal-400 text-xs font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-700/50">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent
                  rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <span className="text-3xl">🔔</span>
                <p className="text-sm text-slate-400">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-700 bg-slate-800/80">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push(
                    userType === 'admin_user'
                      ? '/admin/notifications'
                      : '/notifications'
                  );
                }}
                className="w-full text-xs text-center text-teal-400
                  hover:text-teal-300 transition-colors"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
