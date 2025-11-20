'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { Lead } from '@/types';
import { FiUsers, FiRefreshCw, FiFilter, FiSearch } from 'react-icons/fi';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
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
        api.getLeads(), // Fetch all leads for the leads page (no limit)
        timeoutPromise
      ]) as any;
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setLeads(data);
      } else if (data && data.error) {
        // If API returned an error object, throw it
        throw new Error(data.error || 'Failed to load leads');
      } else {
        // If data is not an array and not an error, set empty array
        setLeads([]);
      }
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message || 'Failed to load leads');
      setLeads([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCRM = async () => {
    setSyncing(true);
    try {
      await api.syncCRM();
      // Refresh leads after sync
      await fetchLeads();
      alert('CRM synced successfully!');
    } catch (err: any) {
      console.error('Error syncing CRM:', err);
      alert('Failed to sync CRM: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const filteredLeads = Array.isArray(leads) ? leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.descriptionOfEnquiry && lead.descriptionOfEnquiry.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    // Handle service type filter (check both camelCase and snake_case)
    const leadServiceType = (lead as any).serviceType || (lead as any).service_type;
    const matchesServiceType = serviceTypeFilter === 'all' || leadServiceType === serviceTypeFilter;
    
    return matchesSearch && matchesStatus && matchesServiceType;
  }) : [];

  const statusCounts = {
    all: Array.isArray(leads) ? leads.length : 0,
    new: Array.isArray(leads) ? leads.filter(l => l.status === 'new').length : 0,
    contacted: Array.isArray(leads) ? leads.filter(l => l.status === 'contacted').length : 0,
    qualified: Array.isArray(leads) ? leads.filter(l => l.status === 'qualified').length : 0,
    converted: Array.isArray(leads) ? leads.filter(l => l.status === 'converted').length : 0,
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600 mt-1">
              Manage your leads from CRM and other sources
            </p>
          </div>
          <button
            onClick={handleSyncCRM}
            disabled={syncing}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiRefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync CRM'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statusCounts.all}</p>
              </div>
              <FiUsers className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{statusCounts.new}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{statusCounts.contacted}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts.qualified}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{statusCounts.converted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
            {/* Service Type Filter */}
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" />
              <select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Service Types</option>
                <option value="consultation">Consultation</option>
                <option value="coaching">Coaching</option>
                <option value="therapy">Therapy</option>
                <option value="session">Session</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-500 mb-4">
                  {leads.length === 0 
                    ? 'No leads yet. Sync your CRM to import leads from SimplyBook.me'
                    : 'No leads match your search criteria'}
                </p>
                {leads.length === 0 && (
                  <button
                    onClick={handleSyncCRM}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Sync CRM Now
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => {
                    const serviceType = (lead as any).serviceType || (lead as any).service_type || 'N/A';
                    const price = (lead as any).price || lead.price;
                    const potentialValue = (lead as any).potentialValue || (lead as any).potential_value || lead.potentialValue;
                    const description = (lead as any).descriptionOfEnquiry || (lead as any).description_of_enquiry || lead.descriptionOfEnquiry;
                    
                    return (
                      <tr 
                        key={lead.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => window.location.href = `/leads/${lead.id}`}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                          {description && (
                            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs" title={description}>
                              {description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {serviceType !== 'N/A' ? serviceType : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {price ? `$${parseFloat(price).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {potentialValue ? `$${parseFloat(potentialValue).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                            lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.lastContacted ? new Date(lead.lastContacted).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

