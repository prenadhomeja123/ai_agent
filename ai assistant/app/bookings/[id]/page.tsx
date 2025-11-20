'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiSave, 
  FiX, 
  FiCalendar,
  FiClock,
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiMessageSquare,
  FiTrendingUp,
} from 'react-icons/fi';
import { api } from '@/lib/api';
import { Message, AgentActivity } from '@/types';

interface Booking {
  id: number;
  lead: number;
  lead_name: string;
  lead_email: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  location: string;
  booking_type: string;
  property?: string;
  revenue?: number;
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (bookingId) {
      fetchData();
    }
  }, [bookingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 8000);
      });
      
      const bookingData = await Promise.race([
        api.getBooking(bookingId).catch(() => null),
        timeoutPromise
      ]) as Booking | null;

      if (!bookingData) {
        setError('Booking not found');
        setLoading(false);
        return;
      }

      setBooking(bookingData);
      setFormData({
        title: bookingData.title,
        description: bookingData.description || '',
        status: bookingData.status,
        location: bookingData.location || '',
        booking_type: bookingData.booking_type || '',
        property: (bookingData as any).property || '',
        revenue: (bookingData as any).revenue || '',
      });
      
      // Fetch messages and activities for this booking
      const [leadMessages, allActivities] = await Promise.all([
        api.getMessages(bookingData.lead.toString()).catch(() => []),
        api.getAgentActivity({ limit: 50 }).catch(() => []),
      ]);
      
      setMessages(Array.isArray(leadMessages) ? leadMessages : []);
      
      // Filter activities for this booking
      const bookingActivities = (Array.isArray(allActivities) ? allActivities : []).filter((a: AgentActivity) => 
        a.details && (a.details.booking_id === bookingData.id || a.details.booking === bookingData.id)
      );
      setActivities(bookingActivities);
    } catch (err: any) {
      console.error('Error fetching booking data:', err);
      setError(err.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        location: formData.location,
        booking_type: formData.booking_type,
      };
      
      if (formData.property) updateData.property = formData.property;
      if (formData.revenue) updateData.revenue = formData.revenue;
      
      await api.updateBooking(bookingId, updateData);
      setEditing(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating booking:', err);
      alert('Failed to update booking: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
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

  if (error || !booking) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error || 'Booking not found'}</p>
          <button
            onClick={() => router.push('/bookings')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Bookings
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
              onClick={() => router.push('/bookings')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editing ? 'Edit Booking' : booking.title}
              </h1>
              <p className="text-sm text-gray-600">Guest: {booking.lead_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      title: booking.title,
                      description: booking.description || '',
                      status: booking.status,
                      location: booking.location || '',
                      booking_type: booking.booking_type || '',
                      property: (booking as any).property || '',
                      revenue: (booking as any).revenue || '',
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
            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                    <input
                      type="text"
                      value={formData.property}
                      onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Property name or address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
                    <input
                      type="text"
                      value={formData.booking_type}
                      onChange={(e) => setFormData({ ...formData, booking_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Guest Name</p>
                      <p className="text-base font-medium text-gray-900">{booking.lead_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(booking.start_time)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </p>
                    </div>
                    {(booking as any).property && (
                      <div>
                        <p className="text-sm text-gray-600">Property</p>
                        <p className="text-base font-medium text-gray-900">{(booking as any).property}</p>
                      </div>
                    )}
                    {(booking as any).revenue && (
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-base font-medium text-green-600">
                          ${parseFloat((booking as any).revenue).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                  {booking.location && (
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-base text-gray-900">{booking.location}</p>
                    </div>
                  )}
                  {booking.booking_type && (
                    <div>
                      <p className="text-sm text-gray-600">Booking Type</p>
                      <p className="text-base text-gray-900">{booking.booking_type}</p>
                    </div>
                  )}
                  {booking.description && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{booking.description}</p>
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
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="text-lg font-bold text-gray-900">{booking.duration_minutes} min</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Messages</p>
                  <p className="text-lg font-bold text-gray-900">{messages.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">AI Activities</p>
                  <p className="text-lg font-bold text-gray-900">{activities.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

