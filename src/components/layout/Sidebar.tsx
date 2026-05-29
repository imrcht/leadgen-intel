'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  LayoutDashboard,
  History,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/search', label: 'New Search', icon: Search },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      } glass border-r border-surface-800/50`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-800/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-base font-bold gradient-text-primary leading-tight">
              LeadGen Intel
            </h1>
            <p className="text-[10px] text-surface-500 font-medium tracking-wider uppercase">
              Intelligence Platform
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-primary-400'
                    : 'text-surface-500 group-hover:text-surface-300'
                }`}
              />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-surface-500 hover:text-surface-300 hover:bg-surface-800/50 transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Usage indicator */}
      {!collapsed && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-surface-800/40 border border-surface-700/30 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-surface-400">Searches Today</span>
            <span className="text-xs font-semibold text-primary-400">
              3 / 100
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-700 overflow-hidden">
            <div
              className="h-full rounded-full progress-bar-fill"
              style={{ width: '3%' }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
