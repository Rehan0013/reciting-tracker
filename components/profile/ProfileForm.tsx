'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileFormProps {
  initialUser: {
    name: string;
    email: string;
  };
  onUpdateSuccess: () => void;
}

export default function ProfileForm({
  initialUser,
  onUpdateSuccess,
}: ProfileFormProps) {
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);
  
  // Password state fields
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility triggers
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status flags
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Basic password checking if password section is open
    if (showPasswordSection) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setErrorMsg('Please fill in all password fields');
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      const payload: any = { name, email };
      if (showPasswordSection) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update profile');
      } else {
        setSuccessMsg('Profile updated successfully!');
        
        // Reset password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
        
        onUpdateSuccess();
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 select-none">
      {successMsg && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-[2px] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-[2px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label htmlFor="display-name" className="block text-sm font-medium text-foreground mb-1">
          display name
        </label>
        <input
          id="display-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-border bg-background px-3.5 py-2.5 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-base min-h-[44px]"
        />
      </div>

      <div>
        <label htmlFor="email-address" className="block text-sm font-medium text-foreground mb-1">
          email address
        </label>
        <input
          id="email-address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border bg-background px-3.5 py-2.5 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-base min-h-[44px]"
        />
      </div>

      {/* Collapsible Password Change Section */}
      <div className="border border-border p-3.5 rounded-card space-y-3 bg-secondary/15">
        <button
          type="button"
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="text-xs font-bold text-primary hover:underline cursor-pointer focus:outline-none capitalize min-h-[30px]"
        >
          {showPasswordSection ? 'cancel password change' : 'change password →'}
        </button>

        {showPasswordSection && (
          <div className="space-y-4 pt-2 animate-fade-in">
            {/* Current Password */}
            <div>
              <label htmlFor="current-pass" className="block text-sm font-medium text-foreground mb-1">
                current password
              </label>
              <div className="relative">
                <input
                  id="current-pass"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="enter current password"
                  className="w-full border border-border bg-background pl-3.5 pr-10 py-2.5 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-base min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-pointer focus:outline-none"
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-pass" className="block text-sm font-medium text-foreground mb-1">
                new password
              </label>
              <div className="relative">
                <input
                  id="new-pass"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="minimum 6 characters"
                  className="w-full border border-border bg-background pl-3.5 pr-10 py-2.5 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-base min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-pointer focus:outline-none"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirm-new-pass" className="block text-sm font-medium text-foreground mb-1">
                confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm-new-pass"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="confirm new password"
                  className="w-full border border-border bg-background pl-3.5 pr-10 py-2.5 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-base min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-pointer focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-btn hover:bg-opacity-95 flex items-center justify-center gap-2 cursor-pointer focus:outline-none min-h-[44px]"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            saving changes...
          </>
        ) : (
          'save changes'
        )}
      </button>
    </form>
  );
}
