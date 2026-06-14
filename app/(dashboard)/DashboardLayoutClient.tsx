'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Calendar,
  History,
  User as UserIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export default function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Background check for daily notification reminders
  useEffect(() => {
    if (!user.id) return;

    let timer: NodeJS.Timeout;

    const scheduleNotification = (timeStr: string) => {
      const [hrs, mins] = timeStr.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hrs, mins, 0, 0);

      // If reminder time has already passed today, target tomorrow
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();

      timer = setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = 'quran daily tracker';
          const options = {
            body: 'time for your daily quran reading 📖',
            icon: '/favicon.ico',
          };

          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_NOTIFICATION',
              title,
              body: options.body,
            });
          } else {
            new Notification(title, options);
          }
        }
        // Reschedule for the next day
        scheduleNotification(timeStr);
      }, delay);
    };

    const fetchReminderSettings = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.reminderTime) {
            scheduleNotification(data.reminderTime);
          }
        }
      } catch (err) {
        console.warn('Could not load reminder details in layout scheduler:', err);
      }
    };

    fetchReminderSettings();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user.id]);

  const navItems = [
    {
      label: 'calendar',
      href: '/',
      icon: Calendar,
    },
    {
      label: 'history',
      href: '/history',
      icon: History,
    },
    {
      label: 'profile',
      href: '/profile',
      icon: UserIcon,
    },
  ];

  // Helper to check if a route is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Get display title for mobile header
  const getPageTitle = () => {
    if (pathname === '/') return 'quran tracker';
    if (pathname.startsWith('/day/')) {
      const datePart = pathname.split('/day/')[1];
      return datePart ? `log: ${datePart}` : 'day detail';
    }
    if (pathname.startsWith('/history')) return 'monthly history';
    if (pathname.startsWith('/profile')) return 'my profile';
    return 'quran tracker';
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (Visible md and up)                     */}
      {/* ======================================================== */}
      <aside
        className={`hidden md:flex flex-col border-r-2 border-border bg-card transition-all duration-200 ease-in-out shrink-0 select-none ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        {/* Sidebar Header: Logo & Name */}
        <div className="h-14 border-b border-border flex items-center justify-between px-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 border border-primary bg-secondary text-primary flex items-center justify-center rounded-card shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 1-9-9Z" fill="currentColor" fillOpacity="0.1" />
                <path d="m4 19 8-2 8 2M4 15c2-1 6-2 8-2s6 1 8 2M12 6v11" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="font-serif font-bold text-lg text-foreground whitespace-nowrap">
                quran tracker
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary rounded-[2px] cursor-pointer"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[2px] transition-colors duration-100 min-h-[44px] cursor-pointer ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold border-l-2 border-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Theme Toggle & User Info */}
        <div className="p-2 border-t border-border space-y-2">
          {/* Theme Toggle Button integrated */}
          <div className="flex items-center justify-center w-full">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between w-full px-2 py-1 bg-secondary rounded-[2px] border border-border">
                <span className="text-xs text-muted-foreground">theme mode</span>
                <ThemeToggle />
              </div>
            ) : (
              <ThemeToggle />
            )}
          </div>

          <div
            className={`flex items-center gap-3 p-2 rounded-[2px] ${
              sidebarCollapsed ? 'justify-center' : 'bg-secondary border border-border'
            }`}
          >
            <div className="w-9 h-9 border border-border bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold rounded-full shrink-0">
              {getInitials()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-[2px] transition-colors duration-100 cursor-pointer min-h-[44px] ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>sign out</span>}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTAINER (Mobile Header & Page Content)           */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header (Hidden on desktop) */}
        <header className="md:hidden h-14 border-b-2 border-border bg-card flex items-center justify-between px-4 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="w-9 h-9 border border-border bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold rounded-full cursor-pointer"
            >
              {getInitials()}
            </Link>
          </div>
          <h1 className="font-serif text-lg font-bold text-foreground">
            {getPageTitle()}
          </h1>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content Scroll Container */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 pb-20 md:pb-4 relative bg-background">
          {children}
        </main>

        {/* ======================================================== */}
        {/* MOBILE BOTTOM NAVIGATION (Visible below md)              */}
        {/* ======================================================== */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t-2 border-border bg-card flex items-center justify-around z-10 pb-safe select-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-colors duration-100 min-h-[44px] ${
                  active
                    ? 'text-primary border-t-2 border-primary mt-[-2px]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
                <span className="text-[10px] mt-1 font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
