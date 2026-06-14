'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ProfileForm from '@/components/profile/ProfileForm';
import ReadingTypeManager from '@/components/profile/ReadingTypeManager';
import { User as UserIcon, Bell, Download, Trash2, ShieldAlert, Loader } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  
  // Account Delete Confirmation Dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.reminderTime) {
          setReminderEnabled(true);
          setReminderTime(data.reminderTime);
        } else {
          setReminderEnabled(false);
        }
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Sync / Register Browser Notification Permissions
  const handleToggleReminder = async (enabled: boolean) => {
    if (enabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setReminderEnabled(true);
          await updateReminderTime(true, reminderTime);
          
          // Try registering simple Service Worker locally
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((err) => {
              console.warn('SW registration skipped, using standard client scheduler:', err);
            });
          }
        } else {
          alert('Notification permission was denied. Please enable it in browser settings.');
          setReminderEnabled(false);
        }
      } else {
        alert('Notifications are not supported in this browser.');
        setReminderEnabled(false);
      }
    } else {
      setReminderEnabled(false);
      await updateReminderTime(false, null);
    }
  };

  // Submit Reminder setting to DB
  const updateReminderTime = async (enabled: boolean, time: string | null) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderTime: enabled ? time : null }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to update reminder:', err);
    }
  };

  // Update Reading Types
  const handleUpdateReadingTypes = async (updatedTypes: any[]) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingTypes: updatedTypes }),
    });

    if (!res.ok) throw new Error('Failed to update tracking list');
    const data = await res.json();
    setUser(data);
  };

  // Trigger JSON download export stream
  const handleExportData = () => {
    router.push('/api/profile/export');
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      alert("Please type 'delete' to confirm account closure.");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (res.ok) {
        // Sign out user and redirect to login page
        signOut({ callbackUrl: '/login' });
      } else {
        alert('Failed to delete account. Please try again.');
        setDeleting(false);
      }
    } catch (err) {
      alert('An unexpected error occurred.');
      setDeleting(false);
    }
  };

  // Get initials for avatar display
  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4 pb-12 animate-fade-in">
      
      {/* 1. Header Profile details Card */}
      <div className="flex items-center gap-4 border border-border bg-card p-4 rounded-card select-none">
        <div className="w-16 h-16 border-2 border-primary bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg rounded-full">
          {getInitials()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif font-bold text-xl text-foreground capitalize truncate leading-none">
            {user?.name || 'User'}
          </h2>
          <p className="text-xs text-muted-foreground truncate mt-1.5 leading-none">
            {user?.email}
          </p>
        </div>
      </div>

      {/* 2. Account Information Form */}
      <div className="border-2 border-border bg-card p-4 rounded-card">
        <h3 className="text-sm font-bold text-foreground capitalize mb-4 border-b border-border pb-1.5 flex items-center gap-1.5 select-none">
          <UserIcon className="w-4 h-4 text-primary shrink-0" />
          account profile
        </h3>
        <ProfileForm
          initialUser={{ name: user?.name, email: user?.email }}
          onUpdateSuccess={fetchProfile}
        />
      </div>

      {/* 3. Reading Type Customizer */}
      <div className="border-2 border-border bg-card p-4 rounded-card">
        <h3 className="text-sm font-bold text-foreground capitalize mb-4 border-b border-border pb-1.5 flex items-center gap-1.5 select-none">
          <svg
            className="w-4 h-4 text-primary shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m4 19 8-2 8 2M4 15c2-1 6-2 8-2s6 1 8 2M12 6v11" />
          </svg>
          what i track
        </h3>
        <ReadingTypeManager
          readingTypes={user?.readingTypes || []}
          onUpdate={handleUpdateReadingTypes}
        />
      </div>

      {/* 4. Daily reminder config */}
      <div className="border-2 border-border bg-card p-4 rounded-card space-y-4 select-none">
        <h3 className="text-sm font-bold text-foreground capitalize border-b border-border pb-1.5 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-primary shrink-0" />
          daily reminder notifications
        </h3>
        
        <div className="flex items-center justify-between min-h-[44px]">
          <div>
            <span className="text-sm font-semibold text-foreground capitalize block">
              enable reminder
            </span>
            <span className="text-xs text-muted-foreground lowercase block">
              get notified when it's time to read
            </span>
          </div>
          
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => handleToggleReminder(e.target.checked)}
            className="w-10 h-6 rounded-full border border-border appearance-none bg-secondary cursor-pointer checked:bg-primary relative before:content-[''] before:absolute before:top-[1px] before:left-[1px] before:w-5 before:h-5 before:rounded-full before:bg-background before:transition-transform checked:before:translate-x-4 transition-colors duration-150 focus:outline-none"
            aria-label="Enable reminder toggle"
          />
        </div>

        {reminderEnabled && (
          <div className="animate-fade-in">
            <label htmlFor="reminder-time-input" className="block text-xs font-semibold text-muted-foreground mb-1">
              notification time
            </label>
            <input
              id="reminder-time-input"
              type="time"
              value={reminderTime}
              onChange={(e) => {
                setReminderTime(e.target.value);
                updateReminderTime(true, e.target.value);
              }}
              className="w-full max-w-[150px] border border-border bg-background px-3 py-2 text-sm rounded-[2px] focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>
        )}
      </div>

      {/* 5. Data operations (Export / Delete account) */}
      <div className="border-2 border-border bg-card p-4 rounded-card space-y-3.5 select-none">
        <h3 className="text-sm font-bold text-foreground capitalize border-b border-border pb-1.5">
          data operations
        </h3>

        <button
          onClick={handleExportData}
          className="w-full py-3.5 border border-border bg-background hover:bg-secondary text-foreground text-sm font-semibold rounded-btn flex items-center justify-center gap-2 cursor-pointer focus:outline-none min-h-[44px] capitalize transition-colors duration-100"
        >
          <Download className="w-4 h-4 text-primary shrink-0" />
          export logs as json
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-btn flex items-center justify-center gap-2 cursor-pointer focus:outline-none min-h-[44px] capitalize transition-colors duration-100"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            delete my account
          </button>
        ) : (
          <div className="border border-red-300 bg-red-50/50 p-4 rounded-card space-y-3 animate-fade-in text-xs">
            <div className="flex items-start gap-2 text-red-800 font-bold">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>warning: this is a permanent action and cannot be undone!</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              all your logged readings, custom tracking types, and streak history will be permanently deleted from the database.
            </p>
            <div>
              <label htmlFor="delete-confirm-text" className="block text-red-800 font-bold mb-1.5">
                type "delete" in the field below to confirm:
              </label>
              <input
                id="delete-confirm-text"
                type="text"
                required
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="type delete here"
                className="w-full border border-red-300 bg-background px-3 py-2 text-sm rounded-[2px] focus:outline-none focus:ring-1 focus:ring-red-400 text-red-800 min-h-[44px]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-btn hover:bg-red-700 text-xs min-h-[38px] flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'deleting...' : 'yes, delete everything'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 py-2.5 border border-border bg-card hover:bg-secondary text-foreground font-semibold rounded-btn text-xs min-h-[38px] cursor-pointer"
              >
                cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
