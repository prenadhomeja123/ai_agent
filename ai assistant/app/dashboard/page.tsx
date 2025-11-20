'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { FiUsers, FiMessageSquare, FiZap, FiTrendingUp, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { api } from '@/lib/api';
import { Lead, Message, Automation, AgentActivity } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [activity, setActivity] = useState<AgentActivity[]>([]);
  const [leadStats, setLeadStats] = useState({ total: 0, conversion_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    fetchData();
    // Check onboarding separately (non-blocking)
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // Add timeout for onboarding check (non-blocking)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 3000);
      });
      
      const onboarding = await Promise.race([
        api.getOnboardingStatus(),
        timeoutPromise
      ]) as any;
      
      if (onboarding.current_step && onboarding.current_step !== 'complete') {
        setNeedsOnboarding(true);
      }
    } catch (err) {
      // If onboarding doesn't exist or times out, continue without showing banner
      console.log('Onboarding check:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout: Backend server may not be running. Please check if the server is running at http://localhost:8000'));
        }, 8000);
      });
      
      const [leadsData, automationsData, activityData, statsData] = await Promise.race([
        Promise.all([
          api.getLeads(10).catch(err => { console.error('Error fetching leads:', err); return []; }),
          api.getAutomations().catch(err => { console.error('Error fetching automations:', err); return []; }),
          api.getAgentActivity({ dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), limit: 10 }).catch(err => { console.error('Error fetching activity:', err); return []; }),
          api.getLeadStats().catch(err => { console.error('Error fetching lead stats:', err); return { total: 0, conversion_rate: 0 }; }),
        ]),
        timeoutPromise
      ]) as [Lead[], any, AgentActivity[], any];
      
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      // Ensure automations is always an array
      setAutomations(Array.isArray(automationsData) ? automationsData : []);
      setActivity(Array.isArray(activityData) ? activityData : []);
      setLeadStats(statsData || { total: 0, conversion_rate: 0 });
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setLeads([]);
      setAutomations([]);
      setActivity([]);
      setLeadStats({ total: 0, conversion_rate: 0 });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total Leads',
      value: leadStats.total || leads.length,
      icon: FiUsers,
      change: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Messages Sent',
      value: messages.length,
      icon: FiMessageSquare,
      change: '+8%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
        {
          name: 'Active Automations',
          value: Array.isArray(automations) ? automations.filter(a => a.enabled).length : 0,
          icon: FiZap,
          change: '100%',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
    {
      name: 'Conversion Rate',
      value: `${leadStats.conversion_rate || 0}%`,
      icon: FiTrendingUp,
      change: '+5%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Onboarding Banner */}
        {needsOnboarding && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-900">Complete Your Setup</h3>
              <p className="text-sm text-primary-700">Finish setting up your account to unlock all features.</p>
            </div>
            <button
              onClick={() => router.push('/onboarding')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <span>Continue Setup</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your leads.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
              <a
                href="/leads"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
              >
                <span>View All</span>
                <FiArrowRight className="w-4 h-4" />
              </a>
            </div>
            {leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No leads yet</div>
            ) : (
              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600">{lead.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                      lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Automations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Automations</h2>
              <a
                href="/settings"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
              >
                <span>Manage</span>
                <FiArrowRight className="w-4 h-4" />
              </a>
            </div>
            {!Array.isArray(automations) || automations.filter(a => a.enabled).length === 0 ? (
              <div className="text-center py-8 text-gray-500">No active automations</div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(automations) && automations.filter(a => a.enabled).slice(0, 5).map((automation) => (
                  <div key={automation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{automation.name}</p>
                      <p className="text-sm text-gray-600">Triggered {(automation as any).times_triggered || (automation as any).timesTriggered || 0} times</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recent activity</div>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/bookings"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
          >
            <div className="bg-blue-50 p-3 rounded-lg">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bookings</h3>
              <p className="text-sm text-gray-600">Manage appointments</p>
            </div>
          </a>
          <a
            href="/leads"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
          >
            <div className="bg-green-50 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Leads</h3>
              <p className="text-sm text-gray-600">View all leads</p>
            </div>
          </a>
          <a
            href="/settings"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
          >
            <div className="bg-purple-50 p-3 rounded-lg">
              <FiZap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600">Configure system</p>
            </div>
          </a>
        </div>
      </div>
    </Layout>
  );
}
