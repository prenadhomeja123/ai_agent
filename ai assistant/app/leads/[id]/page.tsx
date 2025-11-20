'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiSave, 
  FiX, 
  FiMail, 
  FiPhone, 
  FiMessageSquare,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
} from 'react-icons/fi';
import { api } from '@/lib/api';
import { Lead, Message, AgentActivity } from '@/types';

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id as string;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (leadId) {
      fetchData();
    }
  }, [leadId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 8000);
      });
      
      const [leadData, messagesData, activitiesData] = await Promise.race([
        Promise.all([
          api.getLead(leadId).catch(() => null),
          api.getMessages(leadId).catch(() => []),
          api.getAgentActivity({ limit: 50 }).catch(() => []),
        ]),
        timeoutPromise
      ]) as [Lead | null, Message[], AgentActivity[]];

      if (!leadData) {
        setError('Lead not found');
        return;
      }

      setLead(leadData);
      setFormData({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || '',
        status: leadData.status,
        source: leadData.source || '',
        serviceType: (leadData as any).serviceType || (leadData as any).service_type || '',
        price: (leadData as any).price || '',
        descriptionOfEnquiry: (leadData as any).descriptionOfEnquiry || (leadData as any).description_of_enquiry || '',
        potentialValue: (leadData as any).potentialValue || (leadData as any).potential_value || '',
        notes: leadData.notes || '',
      });
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (err: any) {
      console.error('Error fetching lead data:', err);
      setError(err.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert form data to backend format
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        source: formData.source,
        notes: formData.notes,
      };
      
      // Add new fields if they exist
      if (formData.serviceType) updateData.service_type = formData.serviceType;
      if (formData.price) updateData.price = formData.price;
      if (formData.descriptionOfEnquiry) updateData.description_of_enquiry = formData.descriptionOfEnquiry;
      if (formData.potentialValue) updateData.potential_value = formData.potentialValue;
      
      await api.updateLead(leadId, updateData);
      setEditing(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead: ' + err.message);
    } finally {
      setSaving(false);
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

  if (error || !lead) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error || 'Lead not found'}</p>
          <button
            onClick={() => router.push('/leads')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Leads
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/leads')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editing ? 'Edit Lead' : lead.name}
              </h1>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: lead.name,
                      email: lead.email,
                      phone: lead.phone || '',
                      status: lead.status,
                      source: lead.source || '',
                      serviceType: (lead as any).serviceType || (lead as any).service_type || '',
                      price: (lead as any).price || '',
                      descriptionOfEnquiry: (lead as any).descriptionOfEnquiry || (lead as any).description_of_enquiry || '',
                      potentialValue: (lead as any).potentialValue || (lead as any).potential_value || '',
                      notes: lead.notes || '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FiX className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4 inline mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <FiEdit className="w-4 h-4 inline mr-2" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Service Type</option>
                      <option value="consultation">Consultation</option>
                      <option value="coaching">Coaching</option>
                      <option value="therapy">Therapy</option>
                      <option value="session">Session</option>
                      <option value="workshop">Workshop</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Potential Value</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.potentialValue}
                        onChange={(e) => setFormData({ ...formData, potentialValue: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description of Enquiry</label>
                    <textarea
                      value={formData.descriptionOfEnquiry}
                      onChange={(e) => setFormData({ ...formData, descriptionOfEnquiry: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe the enquiry..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-base font-medium text-gray-900">{lead.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-base font-medium text-gray-900">{lead.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-base font-medium text-gray-900">{lead.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                        lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                    {(lead as any).serviceType || (lead as any).service_type ? (
                      <div>
                        <p className="text-sm text-gray-600">Service Type</p>
                        <p className="text-base font-medium text-gray-900 capitalize">
                          {(lead as any).serviceType || (lead as any).service_type}
                        </p>
                      </div>
                    ) : null}
                    {(lead as any).price ? (
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-base font-medium text-gray-900">
                          ${parseFloat((lead as any).price).toFixed(2)}
                        </p>
                      </div>
                    ) : null}
                    {(lead as any).potentialValue || (lead as any).potential_value ? (
                      <div>
                        <p className="text-sm text-gray-600">Potential Value</p>
                        <p className="text-base font-medium text-green-600">
                          ${parseFloat((lead as any).potentialValue || (lead as any).potential_value).toFixed(2)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {(lead as any).descriptionOfEnquiry || (lead as any).description_of_enquiry ? (
                    <div>
                      <p className="text-sm text-gray-600">Description of Enquiry</p>
                      <p className="text-base text-gray-900">
                        {(lead as any).descriptionOfEnquiry || (lead as any).description_of_enquiry}
                      </p>
                    </div>
                  ) : null}
                  {lead.source && (
                    <div>
                      <p className="text-sm text-gray-600">Source</p>
                      <p className="text-base text-gray-900">{lead.source}</p>
                    </div>
                  )}
                  {lead.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Actions / Messages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages & AI Actions</h2>
              
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 10).map((message) => (
                    <div key={message.id} className="border-l-4 border-primary-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">{message.channel}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          message.direction === 'inbound' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {message.direction}
                        </span>
                        {message.aiGenerated && (
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            AI Generated
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Activities</h2>
              
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activities yet</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FiTrendingUp className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Total Messages</p>
                  <p className="text-lg font-bold text-gray-900">{messages.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">AI Activities</p>
                  <p className="text-lg font-bold text-gray-900">{activities.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Date Added</p>
                  <p className="text-sm font-medium text-gray-900">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {lead.lastContacted && (
                  <div>
                    <p className="text-xs text-gray-600">Last Contacted</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(lead.lastContacted).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

