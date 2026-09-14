import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Settings, 
  X,
  ShieldCheck,
  Activity,
  History,
  LogOut,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ 
  isOpen, 
  onClose
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = (user?.email || '').toLowerCase() === 'ferasalshash@gmail.com';

  const navItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'Dashboard',
      description: 'Analytics & multi-channel KPIs',
      icon: Activity,
      badge: 'Live',
      isActive: (pathname) => pathname === '/dashboard' || pathname === '/'
    },
    {
      id: 'campaigns',
      path: '/campaigns',
      label: 'My Campaigns',
      description: 'Company workspaces & leads',
      icon: Briefcase,
      badge: null,
      isActive: (pathname) => pathname.startsWith('/campaigns')
    },
    {
      id: 'audit',
      path: '/audit',
      label: 'Activity Audit',
      description: 'Full event & telemetry trail',
      icon: History,
      badge: 'Feed',
      isActive: (pathname) => pathname.startsWith('/audit')
    },
    {
      id: 'docs',
      path: '/docs',
      label: 'Integration Guides',
      description: 'BYOK setup, APIs & troubleshooting',
      icon: BookOpen,
      badge: 'Docs',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      isActive: (pathname) => pathname.startsWith('/docs')
    },
    {
      id: 'settings',
      path: '/settings',
      label: 'Account & Security',
      description: 'Profile, password & quotas',
      icon: Settings,
      badge: null,
      isActive: (pathname) => pathname.startsWith('/settings')
    },
    ...(isAdmin ? [
      {
        id: 'admin',
        path: '/admin',
        label: '👑 Admin Automation',
        description: 'System controls & telemetry',
        icon: ShieldCheck,
        badge: 'Root',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        isActive: (pathname) => pathname.startsWith('/admin')
      }
    ] : [])
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Branding & Title */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                LM
              </div>
              <div>
                <span className="font-black text-lg text-slate-900 tracking-tight block">
                  Lead Machine
                </span>
                <span className="text-[11px] font-semibold text-slate-400 block -mt-0.5">
                  B2B SaaS Outbound Suite
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Navigation
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.isActive ? item.isActive(location.pathname) : location.pathname === item.path;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate leading-none">
                            {item.label}
                          </div>
                          <div className={`text-[10px] truncate mt-1 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                          item.badgeColor || (isActive ? 'bg-emerald-700 text-white border-emerald-500' : 'bg-slate-100 text-slate-600 border-slate-200')
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom: Tenant Card & Profile & Sign Out */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5">
          {/* Tenant Status Pill */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-emerald-500 animate-pulse" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-900 truncate" title={user?.email}>
                {user?.email}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold truncate">
                {isAdmin ? 'Super Administrator' : 'Growth Plan Active'}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              signOut();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
