'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { FiFilter, FiDownload, FiSearch } from 'react-icons/fi';
import { AgentActivity } from '@/types';
import { format } from 'date-fns';

export default function AuditPage() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    channel: '',
    search: '',
  });

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchActivities = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockActivities: AgentActivity[] = [
          {
            id: '1',
            type: 'message_sent',
            description: 'Sent follow-up email to Sarah Johnson',
            channel: 'email',
            leadId: '1',
            timestamp: '2024-01-15T10:30:00',
            details: { subject: 'Follow-up on your inquiry', status: 'delivered' },
          },
          {
            id: '2',
            type: 'message_replied',
            description: 'Auto-replied to SMS from Mike Chen',
            channel: 'sms',
            leadId: '2',
            timestamp: '2024-01-15T09:15:00',
            details: { content: 'Thank you for your message...', status: 'sent' },
          },
          {
            id: '3',
            type: 'followup_triggered',
            description: 'Lead follow-up automation triggered for Emily Davis',
            channel: 'email',
            leadId: '3',
            timestamp: '2024-01-15T08:00:00',
            details: { automation: 'Lead Follow-up', trigger: 'New lead added' },
          },
          {
            id: '4',
            type: 'crm_updated',
            description: 'Updated CRM record: Lead converted to client',
            leadId: '3',
            timestamp: '2024-01-14T16:45:00',
            details: { action: 'Status changed', from: 'qualified', to: 'converted' },
          },
          {
            id: '5',
            type: 'automation_ran',
            description: 'Booking reminder sent via WhatsApp',
            channel: 'whatsapp',
            leadId: '2',
            timestamp: '2024-01-14T14:20:00',
            details: { automation: 'Booking Reminder', trigger: '24h before booking' },
          },
        ];
        
        setActivities(mockActivities);
        setFilteredActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    let filtered = [...activities];

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (a) => new Date(a.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (a) => new Date(a.timestamp) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    if (filters.channel) {
      filtered = filtered.filter((a) => a.channel === filters.channel);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.description.toLowerCase().includes(searchLower) ||
          a.type.toLowerCase().includes(searchLower)
      );
    }

    setFilteredActivities(filtered);
  }, [filters, activities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message_sent':
        return '📧';
      case 'message_replied':
        return '💬';
      case 'followup_triggered':
        return '⚡';
      case 'crm_updated':
        return '📝';
      case 'automation_ran':
        return '🤖';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message_sent':
        return 'bg-blue-100 text-blue-800';
      case 'message_replied':
        return 'bg-green-100 text-green-800';
      case 'followup_triggered':
        return 'bg-purple-100 text-purple-800';
      case 'crm_updated':
        return 'bg-orange-100 text-orange-800';
      case 'automation_ran':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit History</h1>
            <p className="text-gray-600 mt-1">Complete log of all AI agent actions and activities</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <FiDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiFilter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
              <select
                value={filters.channel}
                onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Channels</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search activities..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Activity Log ({filteredActivities.length} entries)
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredActivities.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p>No activities found matching your filters</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getActivityColor(activity.type)}`}>
                          {activity.type.replace('_', ' ').toUpperCase()}
                        </span>
                        {activity.channel && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {activity.channel.toUpperCase()}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {format(new Date(activity.timestamp), 'MMM dd, yyyy • hh:mm a')}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{activity.description}</p>
                      {activity.details && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


