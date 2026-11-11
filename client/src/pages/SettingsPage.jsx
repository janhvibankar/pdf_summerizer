import React, { useState } from 'react';
import { User, Sliders, Palette, Shield, ShieldAlert } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import { useUI } from '../context/UIContext.jsx';
import { SUMMARY_FORMATS } from '../utils/mockDocuments.js';

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@example.com');
  const [bio, setBio] = useState(
    'Senior Research Analyst focusing on clean tech and infrastructure.'
  );
  const [defaultFormat, setDefaultFormat] = useState('executive');
  const [readingSpeed, setReadingSpeed] = useState('220');
  const { addToast } = useUI();

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security & Access', icon: Shield }
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile changes saved in local prototype session', 'success');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addToast('Preferences updated locally', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-surface-border pb-5">
        <h1 className="text-2xl font-serif font-bold text-navy-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-navy-500 mt-1">
          Customize your PRANPAN editorial reading experience and personal profile.
        </p>
      </div>

      {/* Scope Notice */}
      <div className="p-3 rounded-md bg-warm-100 border border-warm-200 text-xs text-navy-600 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <span className="font-semibold text-navy-800">Phase 1 Design Preview:</span> Settings
          controls represent the client-side interaction design. Profile updates and security
          policies will be persisted via database integration in Phase 2.
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
            <Card title="User Profile" subtitle="Your public workspace information">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-base">
                    JD
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => addToast('Avatar upload available in Phase 2', 'info')}
                    >
                      Change Avatar
                    </Button>
                    <p className="text-[11px] text-navy-400 mt-1 font-mono">
                      JPG, PNG or SVG under 2 MB
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
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Textarea
                  label="Professional Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" size="sm">
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
                    Current active session on this device: <strong>Chrome on Windows 11</strong>
                  </p>
                  <p className="text-[11px] text-navy-400 font-mono mt-1">
                    IP: 127.0.0.1 (Localhost)
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToast('Password update connects in Phase 2', 'info')}
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
