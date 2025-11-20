'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { FiToggleLeft, FiToggleRight, FiCheck, FiRefreshCw, FiLink, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';

interface AppSettings {
  channels: {
    email: { enabled: boolean; provider: string };
    sms: { enabled: boolean; provider: string };
    whatsapp: { enabled: boolean; provider: string };
    facebook: { enabled: boolean; provider: string };
    instagram: { enabled: boolean; provider: string };
  };
  crm: {
    provider: string;
    connected: boolean;
    lastSynced: string | null;
    apiKey?: string;
  };
  automations: {
    leadFollowup: boolean;
    bookingReminder: boolean;
    confirmation: boolean;
    postSession: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    channels: {
      email: { enabled: true, provider: 'Gmail' },
      sms: { enabled: true, provider: 'Twilio' },
      whatsapp: { enabled: false, provider: 'Meta' },
      facebook: { enabled: false, provider: 'Meta' },
      instagram: { enabled: false, provider: 'Meta' },
    },
    crm: {
      provider: 'SimplyBook.me',
      connected: false,
      lastSynced: null,
    },
    automations: {
      leadFollowup: true,
      bookingReminder: true,
      confirmation: true,
      postSession: true,
    },
    notifications: {
      email: true,
      sms: false,
      inApp: true,
    },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [crmApiKey, setCrmApiKey] = useState('');
  const [connectingCrm, setConnectingCrm] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout: Backend server may not be running. Please check if the server is running at http://localhost:8000'));
        }, 8000);
      });
      
      const data = await Promise.race([
        api.getSettings(),
        timeoutPromise
      ]) as any;
      
      setSettings(data);
      // Load CRM API key if connected
      if (data.crm?.connected && data.crm?.apiKey) {
        setCrmApiKey(data.crm.apiKey);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category: 'automations' | 'notifications', key: string) => {
    setSettings((prev) => {
      if (category === 'automations') {
        return {
          ...prev,
          automations: {
            ...prev.automations,
            [key]: !prev.automations[key as keyof typeof prev.automations],
          },
        };
      } else if (category === 'notifications') {
        return {
          ...prev,
          notifications: {
            ...prev.notifications,
            [key]: !prev.notifications[key as keyof typeof prev.notifications],
          },
        };
      }
      return prev;
    });
    setSaved(false);
  };

  const handleChannelToggle = (channel: string) => {
    setSettings((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel as keyof typeof prev.channels],
          enabled: !prev.channels[channel as keyof typeof prev.channels].enabled,
        },
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Update automations based on settings
      await updateAutomationsFromSettings();
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateAutomationsFromSettings = async () => {
    // Update individual automations based on settings
    try {
      const automations = await api.getAutomations();
      
      for (const automation of automations) {
        let shouldBeEnabled = false;
        
        if (automation.type === 'lead_followup' && settings.automations.leadFollowup) {
          shouldBeEnabled = true;
        } else if (automation.type === 'booking_reminder' && settings.automations.bookingReminder) {
          shouldBeEnabled = true;
        } else if (automation.type === 'confirmation' && settings.automations.confirmation) {
          shouldBeEnabled = true;
        } else if (automation.type === 'post_session' && settings.automations.postSession) {
          shouldBeEnabled = true;
        }
        
        // Update automation if state changed
        if (automation.enabled !== shouldBeEnabled) {
          await api.toggleAutomation(automation.id, shouldBeEnabled);
        }
      }
    } catch (err) {
      console.error('Error updating automations:', err);
      // Don't fail the whole save if automation update fails
    }
  };

  const handleConnectCRM = async () => {
    if (!crmApiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    
    setConnectingCrm(true);
    setError('');
    try {
      // Update CRM settings with API key
      const updatedSettings = {
        ...settings,
        crm: {
          ...settings.crm,
          connected: true,
          apiKey: crmApiKey,
        }
      };
      
      await api.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Error connecting CRM:', err);
      setError(err.message || 'Failed to connect CRM');
    } finally {
      setConnectingCrm(false);
    }
  };

  const handleDisconnectCRM = async () => {
    setConnectingCrm(true);
    setError('');
    try {
      const updatedSettings = {
        ...settings,
        crm: {
          ...settings.crm,
          connected: false,
          apiKey: '',
        }
      };
      
      await api.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      setCrmApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Error disconnecting CRM:', err);
      setError(err.message || 'Failed to disconnect CRM');
    } finally {
      setConnectingCrm(false);
    }
  };

  const handleSyncCRM = async () => {
    setConnectingCrm(true);
    setError('');
    setSyncStats(null);
    try {
      // Trigger CRM sync
      const response = await api.syncCRM();
      if (response.success) {
        await fetchSettings(); // Refresh to get new lastSynced
        setSyncStats(response.stats || null);
        setSaved(true);
        setTimeout(() => setSaved(false), 5000);
      } else {
        setError(response.error || 'Failed to sync CRM');
      }
    } catch (err: any) {
      console.error('Error syncing CRM:', err);
      setError(err.message || 'Failed to sync CRM');
    } finally {
      setConnectingCrm(false);
    }
  };

  const ToggleButton = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => {
    return (
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your automations, channels, and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {saved ? (
              <>
                <FiCheck className="w-5 h-5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* CRM Integration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CRM Integration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{settings.crm.provider}</p>
                <p className="text-sm text-gray-500">
                  {settings.crm.connected ? 'Connected' : 'Not connected'}
                  {settings.crm.lastSynced && ` • Last synced: ${new Date(settings.crm.lastSynced).toLocaleString()}`}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                settings.crm.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {settings.crm.connected ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {!settings.crm.connected ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={crmApiKey}
                    onChange={(e) => setCrmApiKey(e.target.value)}
                    placeholder="Enter SimplyBook.me API key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleConnectCRM}
                  disabled={connectingCrm || !crmApiKey.trim()}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <FiLink className="w-4 h-4" />
                  <span>{connectingCrm ? 'Connecting...' : 'Connect CRM'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={handleSyncCRM}
                    disabled={connectingCrm}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${connectingCrm ? 'animate-spin' : ''}`} />
                    <span>{connectingCrm ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                  <button
                    onClick={handleDisconnectCRM}
                    disabled={connectingCrm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Your CRM is connected. Click "Sync Now" to sync leads and bookings.
                </p>
                {syncStats && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Last Sync Results</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-green-700">Leads Created:</span>
                        <span className="font-semibold ml-2">{syncStats.leads_created || 0}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Leads Updated:</span>
                        <span className="font-semibold ml-2">{syncStats.leads_updated || 0}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Bookings Found:</span>
                        <span className="font-semibold ml-2">{syncStats.bookings_found || 0}</span>
                      </div>
                      {syncStats.errors_count > 0 && (
                        <div>
                          <span className="text-red-700">Errors:</span>
                          <span className="font-semibold ml-2">{syncStats.errors_count}</span>
                        </div>
                      )}
                    </div>
                    {syncStats.errors && syncStats.errors.length > 0 && (
                      <div className="mt-2 text-xs text-red-600">
                        <p className="font-semibold">Errors:</p>
                        <ul className="list-disc list-inside">
                          {syncStats.errors.slice(0, 3).map((err: string, idx: number) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messaging Channels */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messaging Channels</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enable or disable messaging channels. Disabled channels will not send or receive messages.
          </p>
          <div className="space-y-4">
            {Object.entries(settings.channels).map(([channel, config]) => (
              <div key={channel} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{channel}</p>
                  <p className="text-sm text-gray-500">{config.provider}</p>
                </div>
                <ToggleButton
                  enabled={config.enabled}
                  onChange={() => handleChannelToggle(channel)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Automations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Automations</h2>
          <p className="text-sm text-gray-600 mb-6">
            Toggle automations on or off. When enabled, the AI agent will automatically trigger these actions.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Lead Follow-up</p>
                <p className="text-sm text-gray-500">Automatically follow up with new leads</p>
              </div>
              <ToggleButton
                enabled={settings.automations.leadFollowup}
                onChange={() => handleToggle('automations', 'leadFollowup')}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Booking Reminder</p>
                <p className="text-sm text-gray-500">Send reminders before scheduled bookings</p>
              </div>
              <ToggleButton
                enabled={settings.automations.bookingReminder}
                onChange={() => handleToggle('automations', 'bookingReminder')}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Confirmation</p>
                <p className="text-sm text-gray-500">Send booking confirmations automatically</p>
              </div>
              <ToggleButton
                enabled={settings.automations.confirmation}
                onChange={() => handleToggle('automations', 'confirmation')}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Post-Session Follow-up</p>
                <p className="text-sm text-gray-500">Follow up after completed sessions</p>
              </div>
              <ToggleButton
                enabled={settings.automations.postSession}
                onChange={() => handleToggle('automations', 'postSession')}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose how you want to be notified about important events and AI agent activities.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <ToggleButton
                enabled={settings.notifications.email}
                onChange={() => handleToggle('notifications', 'email')}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <ToggleButton
                enabled={settings.notifications.sms}
                onChange={() => handleToggle('notifications', 'sms')}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">In-App Notifications</p>
                <p className="text-sm text-gray-500">Show notifications in the portal</p>
              </div>
              <ToggleButton
                enabled={settings.notifications.inApp}
                onChange={() => handleToggle('notifications', 'inApp')}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


