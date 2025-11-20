'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { FiCheck, FiX, FiArrowRight, FiArrowLeft, FiLoader, FiLink, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';
import { api } from '@/lib/api';

interface OnboardingData {
  step: string;
  crm?: {
    provider: string;
    api_key: string;
    company_login?: string;
  };
  email?: {
    provider: string;
    smtp_host: string;
    smtp_user: string;
    smtp_password: string;
  };
  sms?: {
    provider: string;
    twilio_sid: string;
    twilio_token: string;
    twilio_phone: string;
  };
  whatsapp?: {
    provider: string;
    twilio_sid: string;
    twilio_token: string;
  };
  facebook?: {
    page_id: string;
    access_token: string;
  };
  instagram?: {
    account_id: string;
    access_token: string;
  };
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', description: 'Get started with Infinite Base Agent' },
  { id: 'crm_connection', title: 'CRM Connection', description: 'Connect your CRM system' },
  { id: 'booking_setup', title: 'Booking Setup', description: 'Configure booking system' },
  { id: 'channels_setup', title: 'Channels Setup', description: 'Set up communication channels' },
  { id: 'automations_setup', title: 'Automations', description: 'Configure automations' },
  { id: 'complete', title: 'Complete', description: 'You\'re all set!' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({ step: 'welcome' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [testingCrm, setTestingCrm] = useState(false);
  const [crmTestResult, setCrmTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 5000);
      });
      
      const data = await Promise.race([
        api.getOnboardingStatus(),
        timeoutPromise
      ]) as any;
      
      if (data.current_step) {
        const stepIndex = STEPS.findIndex(s => s.id === data.current_step);
        if (stepIndex >= 0) {
          setCurrentStepIndex(stepIndex);
        }
        setOnboardingData(data);
      }
    } catch (err: any) {
      console.error('Error fetching onboarding status:', err);
      // If onboarding doesn't exist, start from welcome
      setCurrentStepIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStepIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentStepIndex + 1].id;
      await saveStep(nextStep);
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const saveStep = async (step?: string) => {
    try {
      setSaving(true);
      setError('');
      const stepToSave = step || STEPS[currentStepIndex].id;
      const dataToSave: any = {
        step: stepToSave,
      };
      
      // Only include non-empty nested objects
      if (onboardingData.crm?.api_key || onboardingData.crm?.provider) {
        dataToSave.crm = onboardingData.crm;
      }
      if (onboardingData.email?.smtp_host) {
        dataToSave.email = onboardingData.email;
      }
      if (onboardingData.sms?.twilio_sid) {
        dataToSave.sms = onboardingData.sms;
      }
      if (onboardingData.whatsapp?.twilio_sid) {
        dataToSave.whatsapp = onboardingData.whatsapp;
      }
      if (onboardingData.facebook?.page_id) {
        dataToSave.facebook = onboardingData.facebook;
      }
      if (onboardingData.instagram?.account_id) {
        dataToSave.instagram = onboardingData.instagram;
      }
      
      await api.updateOnboarding(dataToSave);
    } catch (err: any) {
      setError(err.message || 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const testCrmConnection = async () => {
    if (!onboardingData.crm?.api_key) {
      setCrmTestResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    try {
      setTestingCrm(true);
      setCrmTestResult(null);
      const result = await api.testCrmConnection(
        onboardingData.crm.api_key,
        onboardingData.crm.provider || 'SimplyBook.me'
      );
      setCrmTestResult({
        success: result.success,
        message: result.message || result.error || 'Connection test completed',
      });
    } catch (err: any) {
      setCrmTestResult({
        success: false,
        message: err.message || 'Failed to test connection',
      });
    } finally {
      setTestingCrm(false);
    }
  };

  const handleComplete = async () => {
    await saveStep('complete');
    router.push('/dashboard');
  };

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => {
      const updated = { ...prev, ...updates };
      // Ensure nested objects exist
      if (updates.crm) {
        updated.crm = { ...prev.crm, ...updates.crm };
      }
      if (updates.email) {
        updated.email = { ...prev.email, ...updates.email };
      }
      if (updates.sms) {
        updated.sms = { ...prev.sms, ...updates.sms };
      }
      if (updates.whatsapp) {
        updated.whatsapp = { ...prev.whatsapp, ...updates.whatsapp };
      }
      if (updates.facebook) {
        updated.facebook = { ...prev.facebook, ...updates.facebook };
      }
      if (updates.instagram) {
        updated.instagram = { ...prev.instagram, ...updates.instagram };
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      index <= currentStepIndex
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <FiCheck className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-center text-gray-600 max-w-[100px]">
                    {step.title}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
            <p className="text-gray-600 mt-1">{currentStep.description}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Welcome Step */}
          {currentStep.id === 'welcome' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Welcome to Infinite Base Agent!
                </h3>
                <p className="text-gray-600 mb-6">
                  Let's get you set up in just a few steps. We'll help you connect your CRM,
                  configure communication channels, and set up automations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <FiLink className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">CRM Integration</h4>
                    <p className="text-sm text-gray-600">Connect SimplyBook.me</p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <FiMessageSquare className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Channels</h4>
                    <p className="text-sm text-gray-600">Email, SMS, WhatsApp, Social</p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <FiCheck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Automations</h4>
                    <p className="text-sm text-gray-600">Set up workflows</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CRM Connection Step */}
          {currentStep.id === 'crm_connection' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CRM Provider
                </label>
                <select
                  value={onboardingData.crm?.provider || 'SimplyBook.me'}
                  onChange={(e) =>
                    updateOnboardingData({
                      crm: { ...onboardingData.crm, provider: e.target.value, api_key: '', company_login: '' },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="SimplyBook.me">SimplyBook.me</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key *
                </label>
                <input
                  type="password"
                  value={onboardingData.crm?.api_key || ''}
                  onChange={(e) =>
                    updateOnboardingData({
                      crm: { 
                        provider: onboardingData.crm?.provider || 'SimplyBook.me',
                        api_key: e.target.value,
                        company_login: onboardingData.crm?.company_login || '',
                      },
                    })
                  }
                  placeholder="Enter your SimplyBook.me API key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Login (Optional)
                </label>
                <input
                  type="text"
                  value={onboardingData.crm?.company_login || ''}
                  onChange={(e) =>
                    updateOnboardingData({
                      crm: { 
                        provider: onboardingData.crm?.provider || 'SimplyBook.me',
                        api_key: onboardingData.crm?.api_key || '',
                        company_login: e.target.value,
                      },
                    })
                  }
                  placeholder="Company login (if required)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={testCrmConnection}
                disabled={testingCrm || !onboardingData.crm?.api_key}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {testingCrm ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <FiLink className="w-4 h-4" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              {crmTestResult && (
                <div
                  className={`p-4 rounded-lg ${
                    crmTestResult.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {crmTestResult.message}
                </div>
              )}
            </div>
          )}

          {/* Channels Setup Step */}
          {currentStep.id === 'channels_setup' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Configure your communication channels. You can skip optional channels and configure them later in Settings.
                </p>
              </div>

              {/* Email */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FiMail className="w-5 h-5" />
                  <span>Email (SMTP)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                    <input
                      type="text"
                      value={onboardingData.email?.smtp_host || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          email: { 
                            provider: onboardingData.email?.provider || 'SMTP',
                            smtp_host: e.target.value,
                            smtp_user: onboardingData.email?.smtp_user || '',
                            smtp_password: onboardingData.email?.smtp_password || '',
                          },
                        })
                      }
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP User</label>
                    <input
                      type="text"
                      value={onboardingData.email?.smtp_user || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          email: { 
                            provider: onboardingData.email?.provider || 'SMTP',
                            smtp_host: onboardingData.email?.smtp_host || '',
                            smtp_user: e.target.value,
                            smtp_password: onboardingData.email?.smtp_password || '',
                          },
                        })
                      }
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                    <input
                      type="password"
                      value={onboardingData.email?.smtp_password || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          email: { 
                            provider: onboardingData.email?.provider || 'SMTP',
                            smtp_host: onboardingData.email?.smtp_host || '',
                            smtp_user: onboardingData.email?.smtp_user || '',
                            smtp_password: e.target.value,
                          },
                        })
                      }
                      placeholder="App password or account password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* SMS/WhatsApp */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FiPhone className="w-5 h-5" />
                  <span>SMS & WhatsApp (Twilio)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account SID</label>
                    <input
                      type="text"
                      value={onboardingData.sms?.twilio_sid || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          sms: { 
                            provider: onboardingData.sms?.provider || 'Twilio',
                            twilio_sid: e.target.value,
                            twilio_token: onboardingData.sms?.twilio_token || '',
                            twilio_phone: onboardingData.sms?.twilio_phone || '',
                          },
                          whatsapp: { 
                            provider: onboardingData.whatsapp?.provider || 'Twilio',
                            twilio_sid: e.target.value,
                            twilio_token: onboardingData.whatsapp?.twilio_token || '',
                          },
                        })
                      }
                      placeholder="ACxxxxxxxxxxxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                    <input
                      type="password"
                      value={onboardingData.sms?.twilio_token || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          sms: { 
                            provider: onboardingData.sms?.provider || 'Twilio',
                            twilio_sid: onboardingData.sms?.twilio_sid || '',
                            twilio_token: e.target.value,
                            twilio_phone: onboardingData.sms?.twilio_phone || '',
                          },
                          whatsapp: { 
                            provider: onboardingData.whatsapp?.provider || 'Twilio',
                            twilio_sid: onboardingData.whatsapp?.twilio_sid || '',
                            twilio_token: e.target.value,
                          },
                        })
                      }
                      placeholder="Your Twilio auth token"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (SMS)</label>
                    <input
                      type="text"
                      value={onboardingData.sms?.twilio_phone || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          sms: { 
                            provider: onboardingData.sms?.provider || 'Twilio',
                            twilio_sid: onboardingData.sms?.twilio_sid || '',
                            twilio_token: onboardingData.sms?.twilio_token || '',
                            twilio_phone: e.target.value,
                          },
                        })
                      }
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Social Media (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Page ID</label>
                    <input
                      type="text"
                      value={onboardingData.facebook?.page_id || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          facebook: { 
                            page_id: e.target.value,
                            access_token: onboardingData.facebook?.access_token || '',
                          },
                        })
                      }
                      placeholder="Your Facebook Page ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Access Token</label>
                    <input
                      type="password"
                      value={onboardingData.facebook?.access_token || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          facebook: { 
                            page_id: onboardingData.facebook?.page_id || '',
                            access_token: e.target.value,
                          },
                        })
                      }
                      placeholder="Facebook Page Access Token"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Account ID</label>
                    <input
                      type="text"
                      value={onboardingData.instagram?.account_id || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          instagram: { 
                            account_id: e.target.value,
                            access_token: onboardingData.instagram?.access_token || '',
                          },
                        })
                      }
                      placeholder="Instagram Business Account ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Access Token</label>
                    <input
                      type="password"
                      value={onboardingData.instagram?.access_token || ''}
                      onChange={(e) =>
                        updateOnboardingData({
                          instagram: { 
                            account_id: onboardingData.instagram?.account_id || '',
                            access_token: e.target.value,
                          },
                        })
                      }
                      placeholder="Instagram Access Token"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep.id === 'complete' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup Complete!</h3>
              <p className="text-gray-600 mb-6">
                You're all set to start using Infinite Base Agent. You can always update your settings later.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep || saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {isLastStep ? (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Get Started</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Next</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

