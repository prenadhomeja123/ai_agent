'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { FiCalendar, FiClock, FiUser, FiMapPin, FiEdit, FiX, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { api } from '@/lib/api';

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout: Backend server may not be running. Please check if the server is running at http://localhost:8000'));
        }, 8000);
      });
      
      const status = filter === 'all' ? undefined : filter;
      const data = await Promise.race([
        api.getBookings(status),
        timeoutPromise
      ]) as any;
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (data && data.error) {
        // If API returned an error object, throw it
        throw new Error(data.error || 'Failed to load bookings');
      } else {
        // If data is not an array and not an error, set empty array
        setBookings([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStartTime(new Date(booking.start_time).toISOString().slice(0, 16));
    setNewEndTime(new Date(booking.end_time).toISOString().slice(0, 16));
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setRescheduling(true);
      setError('');
      const startTimeISO = new Date(newStartTime).toISOString();
      const endTimeISO = newEndTime ? new Date(newEndTime).toISOString() : undefined;
      
      await api.rescheduleBooking(selectedBooking.id, startTimeISO, endTimeISO);
      setShowRescheduleModal(false);
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule booking');
    } finally {
      setRescheduling(false);
    }
  };

  const handleMarkNoShow = async (bookingId: number) => {
    if (!confirm('Mark this booking as no-show?')) return;

    try {
      setError('');
      await api.markNoShow(bookingId);
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to mark as no-show');
    }
  };

  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const data = await api.getAvailability(undefined, startDate, endDate);
      setAvailability(data.availability || []);
    } catch (err: any) {
      setError(err.message || 'Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading bookings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600 mt-1">Manage your appointments and sessions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={checkAvailability}
              disabled={checkingAvailability}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${checkingAvailability ? 'animate-spin' : ''}`} />
              <span>Check Availability</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center space-x-2">
          {['all', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Availability Display */}
        {availability.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Available Time Slots</h3>
            <div className="text-sm text-blue-800">
              {availability.length} available slot(s) found
            </div>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(bookings) && bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/bookings/${booking.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FiUser className="w-4 h-4 mr-1" />
                      <span>{booking.lead_name}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(booking.start_time)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiClock className="w-4 h-4 mr-2" />
                    <span>
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </span>
                  </div>
                  {booking.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span>{booking.location}</span>
                    </div>
                  )}
                  {booking.booking_type && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {booking.booking_type}
                    </div>
                  )}
                  {(booking as any).property && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span className="font-medium">Property:</span>
                      <span className="ml-1">{(booking as any).property}</span>
                    </div>
                  )}
                  {(booking as any).revenue && (
                    <div className="text-sm font-semibold text-green-600">
                      Revenue: ${parseFloat((booking as any).revenue).toFixed(2)}
                    </div>
                  )}
                </div>

                {booking.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{booking.description}</p>
                )}

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  {booking.status === 'scheduled' || booking.status === 'confirmed' ? (
                    <>
                      <button
                        onClick={() => handleReschedule(booking)}
                        className="flex-1 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-sm font-medium flex items-center justify-center space-x-1"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>Reschedule</span>
                      </button>
                      {new Date(booking.start_time) < new Date() && (
                        <button
                          onClick={() => handleMarkNoShow(booking.id)}
                          className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium flex items-center justify-center space-x-1"
                        >
                          <FiAlertCircle className="w-4 h-4" />
                          <span>No Show</span>
                        </button>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reschedule Booking</h3>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rescheduling}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rescheduling ? 'Rescheduling...' : 'Reschedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

