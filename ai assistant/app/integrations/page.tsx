'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  FiLink, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw, 
  FiSettings,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiCalendar,
  FiDatabase,
} from 'react-icons/fi';
import { api } from '@/lib/api';

interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'email' | 'sms' | 'whatsapp' | 'facebook' | 'instagram' | 'calendar';
  connected: boolean;
  provider: string;
  icon: any;
  description: string;
  lastSynced?: string;
  status?: 'active' | 'inactive' | 'error';
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout: Backend server may not be running. Please check if the server is running at http://localhost:8000'));
        }, 8000);
      });
      
      const [settings, onboarding] = await Promise.race([
        Promise.all([
          api.getSettings().catch(() => ({})),
          api.getOnboardingStatus().catch(() => ({})),
        ]),
        timeoutPromise
      ]) as [any, any];

      // Build integrations list from settings
      const integrationsList: Integration[] = [
        {
          id: 'crm',
          name: 'CRM System',
          type: 'crm',
          connected: settings?.crm?.connected || false,
          provider: settings?.crm?.provider || 'SimplyBook.me',
          icon: FiDatabase,
          description: 'Sync leads and bookings with your CRM',
          lastSynced: settings?.crm?.lastSynced || undefined,
          status: settings?.crm?.connected ? 'active' : 'inactive',
        },
        {
          id: 'email',
          name: 'Email',
          type: 'email',
          connected: settings?.channels?.email?.enabled || false,
          provider: settings?.channels?.email?.provider || 'SMTP',
          icon: FiMail,
          description: 'Send and receive emails',
          status: settings?.channels?.email?.enabled ? 'active' : 'inactive',
        },
        {
          id: 'sms',
          name: 'SMS',
          type: 'sms',
          connected: settings?.channels?.sms?.enabled || false,
          provider: settings?.channels?.sms?.provider || 'Twilio',
          icon: FiPhone,
          description: 'Send SMS messages via Twilio',
          status: settings?.channels?.sms?.enabled ? 'active' : 'inactive',
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp',
          type: 'whatsapp',
          connected: settings?.channels?.whatsapp?.enabled || false,
          provider: settings?.channels?.whatsapp?.provider || 'Twilio',
          icon: FiMessageSquare,
          description: 'Send WhatsApp messages via Twilio',
          status: settings?.channels?.whatsapp?.enabled ? 'active' : 'inactive',
        },
        {
          id: 'facebook',
          name: 'Facebook Messenger',
          type: 'facebook',
          connected: settings?.channels?.facebook?.enabled || false,
          provider: settings?.channels?.facebook?.provider || 'Meta',
          icon: FiMessageSquare,
          description: 'Connect Facebook Messenger',
          status: settings?.channels?.facebook?.enabled ? 'active' : 'inactive',
        },
        {
          id: 'instagram',
          name: 'Instagram DM',
          type: 'instagram',
          connected: settings?.channels?.instagram?.enabled || false,
          provider: settings?.channels?.instagram?.provider || 'Meta',
          icon: FiMessageSquare,
          description: 'Connect Instagram Direct Messages',
          status: settings?.channels?.instagram?.enabled ? 'active' : 'inactive',
        },
        {
          id: 'calendar',
          name: 'Calendar',
          type: 'calendar',
          connected: onboarding?.calendar_connected || false,
          provider: onboarding?.calendar_provider || 'Google Calendar',
          icon: FiCalendar,
          description: 'Sync with Google Calendar or Outlook',
          status: onboarding?.calendar_connected ? 'active' : 'inactive',
        },
      ];

      setIntegrations(integrationsList);
    } catch (err: any) {
      console.error('Error fetching integrations:', err);
      setError(err.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (integration: Integration) => {
    try {
      // Update settings based on integration type
      if (integration.type === 'crm') {
        // CRM toggle is handled in settings
        window.location.href = '/settings';
        return;
      }

      // For channels, update via settings API
      const settings = await api.getSettings();
      const channelKey = integration.type as 'email' | 'sms' | 'whatsapp' | 'facebook' | 'instagram';
      
      if (settings.channels && settings.channels[channelKey]) {
        settings.channels[channelKey].enabled = !integration.connected;
        await api.updateSettings(settings);
        await fetchIntegrations();
      }
    } catch (err: any) {
      console.error('Error toggling integration:', err);
      alert('Failed to toggle integration: ' + err.message);
    }
  };

  const handleTestConnection = async (integration: Integration) => {
    try {
      setTesting(integration.id);
      
      if (integration.type === 'crm') {
        const settings = await api.getSettings();
        const apiKey = settings?.crm?.api_key;
        
        if (!apiKey) {
          alert('Please configure your CRM API key in Settings first.');
          return;
        }
        
        await api.testCrmConnection(apiKey, settings?.crm?.provider || 'SimplyBook.me');
        alert('CRM connection test successful!');
      } else {
        // For other integrations, just show a message
        alert(`${integration.name} connection is ${integration.connected ? 'active' : 'inactive'}`);
      }
    } catch (err: any) {
      console.error('Error testing connection:', err);
      alert('Connection test failed: ' + err.message);
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading integrations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-sm text-gray-600 mt-1">Connect and manage your third-party services</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = integration.connected;
            const statusColor = integration.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : integration.status === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800';

            return (
              <div
                key={integration.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  isConnected ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${
                        isConnected ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isConnected ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-500">{integration.provider}</p>
                      </div>
                    </div>
                    {isConnected ? (
                      <FiCheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <FiXCircle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                  {/* Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                      {integration.status === 'active' ? 'Connected' : 
                       integration.status === 'error' ? 'Error' : 'Not Connected'}
                    </span>
                    {integration.lastSynced && (
                      <span className="text-xs text-gray-500">
                        Synced {new Date(integration.lastSynced).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggle(integration)}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isConnected
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                    <button
                      onClick={() => handleTestConnection(integration)}
                      disabled={testing === integration.id}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {testing === integration.id ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </button>
                    {integration.type !== 'crm' && (
                      <a
                        href="/settings"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Configure"
                      >
                        <FiSettings className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiLink className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Some integrations require API keys and credentials. 
                Configure them in <a href="/settings" className="underline font-medium">Settings</a> or during <a href="/onboarding" className="underline font-medium">Onboarding</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

