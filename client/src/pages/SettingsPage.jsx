import React, { useState, useEffect } from 'react';
import { User, Sliders, Palette, Shield, Lock, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Modal from '../components/common/Modal.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { SUMMARY_FORMATS } from '../utils/mockDocuments.js';

export const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { addToast } = useUI();

  const [activeSection, setActiveSection] = useState('profile');
  const [name, setName] = useState(user?.name || 'Jane Doe');
  const [email] = useState(user?.email || 'jane@example.com');
  const [bio, setBio] = useState(
    user?.bio || 'Senior Research Analyst focusing on clean tech and infrastructure.'
  );
  const [defaultFormat, setDefaultFormat] = useState('executive');
  const [readingSpeed, setReadingSpeed] = useState('220');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.bio !== undefined) setBio(user.bio);
    }
  }, [user]);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security & Access', icon: Shield }
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      await updateProfile({ name: name.trim(), bio: bio.trim() });
      addToast('Profile changes saved successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addToast('Preferences updated locally.', 'success');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (!/[0-9!@#$%^&*]/.test(newPassword)) {
      setPasswordError('New password must contain at least one number or special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({ currentPassword, newPassword });
      addToast('Password changed successfully.', 'success');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (userName) => {
    if (!userName) return 'JD';
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-surface-border pb-5">
        <h1 className="text-2xl font-serif font-bold text-navy-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-navy-500 mt-1">
          Customize your PRANPAN editorial reading experience, account details, and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors text-left ${
                activeSection === section.id
                  ? 'bg-navy-900 text-white font-semibold shadow-subtle'
                  : 'text-navy-600 hover:bg-warm-100 hover:text-navy-900'
              }`}
            >
              <section.icon className="w-4 h-4 flex-shrink-0" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <Card title="User Profile" subtitle="Your public workspace and identity details">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-base">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() =>
                        addToast('Avatar upload will connect with storage in Phase 3', 'info')
                      }
                    >
                      Change Avatar
                    </Button>
                    <p className="text-[11px] text-navy-400 mt-1 font-mono">
                      Role: {user?.role || 'user'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address (Read-only)"
                    value={email}
                    disabled
                    helperText="Email changes require security verification"
                  />
                </div>

                <Textarea
                  label="Professional Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share a short bio or research focus..."
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={isSavingProfile}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <Card title="Synthesis Preferences" subtitle="Configure default AI summary parameters">
              <form onSubmit={handleSavePreferences} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-navy-900">
                    Default Synthesis Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUMMARY_FORMATS.map((fmt) => (
                      <label
                        key={fmt.id}
                        className={`flex items-start gap-2.5 p-3 rounded-md border text-left cursor-pointer transition-colors ${
                          defaultFormat === fmt.id
                            ? 'border-navy-900 bg-warm-50 shadow-subtle'
                            : 'border-surface-border hover:border-navy-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="defaultFormat"
                          value={fmt.id}
                          checked={defaultFormat === fmt.id}
                          onChange={() => setDefaultFormat(fmt.id)}
                          className="mt-0.5 text-navy-900 focus:ring-accent-600"
                        />
                        <div>
                          <span className="text-xs font-semibold text-navy-900 block">
                            {fmt.label}
                          </span>
                          <span className="text-[11px] text-navy-500 block mt-0.5">
                            {fmt.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="max-w-xs">
                  <Input
                    label="Target Reading Speed (Words Per Minute)"
                    type="number"
                    value={readingSpeed}
                    onChange={(e) => setReadingSpeed(e.target.value)}
                    helperText="Used to estimate reading time savings"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" size="sm">
                    Save Preferences
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <Card
              title="Visual Identity & Theme"
              subtitle="PRANPAN Editorial-Minimal Design Tokens"
            >
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-warm-50 border border-warm-200 text-xs">
                  <span className="font-semibold text-navy-900 block mb-1">
                    Editorial Warm Theme (Active)
                  </span>
                  <p className="text-navy-600 leading-relaxed font-sans">
                    PRANPAN is deliberately designed with warm off-white canvas (#F8F6F1), deep navy
                    text (#0B1524), and muted blue accents (#2253AC) to deliver an editorial reading
                    experience that minimizes eye strain during extended analytical sessions.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                  <div className="p-3 rounded border border-navy-900 bg-white">
                    <span className="w-4 h-4 rounded-full bg-navy-900 inline-block mb-1" />
                    <p className="font-semibold text-navy-900">Navy Primary</p>
                  </div>
                  <div className="p-3 rounded border border-surface-border bg-warm-100">
                    <span className="w-4 h-4 rounded-full bg-warm-400 inline-block mb-1" />
                    <p className="font-semibold text-navy-900">Warm Canvas</p>
                  </div>
                  <div className="p-3 rounded border border-accent-600 bg-white">
                    <span className="w-4 h-4 rounded-full bg-accent-600 inline-block mb-1" />
                    <p className="font-semibold text-navy-900">Accent Blue</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <Card
              title="Security & Authentication"
              subtitle="Password policies and session governance"
            >
              <div className="space-y-4 text-xs text-navy-700">
                <div className="p-4 rounded bg-warm-50 border border-warm-200">
                  <h4 className="font-semibold text-navy-900 mb-1">Session Management</h4>
                  <p className="text-navy-600">
                    Authenticated session secured with an HttpOnly cookie and JWT token.
                  </p>
                  <p className="text-[11px] text-navy-400 font-mono mt-1">
                    User ID: {user?.id || 'Active'} &bull; Role: {user?.role || 'user'}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Lock}
                    onClick={() => {
                      setPasswordError(null);
                      setIsPasswordModalOpen(true);
                    }}
                  >
                    Change Account Password
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        subtitle="Verify your current password and choose a new one"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters with number/symbol"
            required
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isChangingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
