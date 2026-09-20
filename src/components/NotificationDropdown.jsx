import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Briefcase, 
  Mail, 
  Users, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function NotificationDropdown({ 
  notifications = [], 
  onNotificationClick, 
  onMarkAllAsRead, 
  onClearAll 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIconForType = (type) => {
    switch (type) {
      case 'campaign':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'lead':
        return <Users className="w-4 h-4 text-sky-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-amber-600" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getBadgeColorForType = (type) => {
    switch (type) {
      case 'campaign':
        return 'bg-emerald-50 border-emerald-200';
      case 'lead':
        return 'bg-sky-50 border-sky-200';
      case 'email':
        return 'bg-amber-50 border-amber-200';
      case 'admin':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. Header Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border transition-all ${
          isOpen
            ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        
        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 2. Dropdown Menu */}
      {isOpen && (
        <>
          {/* Mobile dismissal backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs sm:hidden" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed left-3 right-3 top-[68px] sm:top-auto sm:left-auto sm:right-0 sm:absolute sm:mt-2.5 sm:w-[400px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] flex flex-col">
            {/* Top Bar: Title & Actions */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-none">Notifications</h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No Notifications</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                    You're all caught up! New campaign updates and lead alerts will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onNotificationClick?.(n);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer flex items-start gap-3 relative ${
                      !n.read ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5 ring-2 ring-emerald-100" />
                    )}

                    {/* Icon Pill */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getBadgeColorForType(n.type)}`}>
                      {getIconForType(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${!n.read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {n.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-300" />
                          {n.time}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 hover:underline">
                          <span>View</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer note */}
            {notifications.length > 0 && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  Click any notification to navigate directly to its workspace
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
