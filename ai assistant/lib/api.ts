// API client for backend integration
// This will be connected to your backend API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const api = {
  // Authentication
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    
    return response.json();
  },

  sendOTP: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        return errorJson;
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response. Make sure backend is running at ' + API_BASE_URL);
    }
    
    return response.json();
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        return errorJson;
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response. Make sure backend is running at ' + API_BASE_URL);
    }
    
    return response.json();
  },

  logout: async () => {
    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    
    // Optionally call backend logout endpoint if you have one
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      // Don't throw error if logout endpoint doesn't exist
      if (response.ok) {
        return response.json();
      }
    } catch (err) {
      // Ignore errors - logout is primarily client-side
      console.log('Backend logout endpoint not available, using client-side logout');
    }
    
    return { success: true, message: 'Logged out successfully' };
  },

  // Leads
  getLeads: async (limit?: number) => {
    const url = limit ? `${API_BASE_URL}/leads?limit=${limit}` : `${API_BASE_URL}/leads`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch (parseError) {
        if (parseError instanceof Error) {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    const data = await response.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : [];
  },

  getLeadStats: async () => {
    const response = await fetch(`${API_BASE_URL}/leads/stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  getLead: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch (parseError) {
        if (parseError instanceof Error) {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  updateLead: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch (parseError) {
        if (parseError instanceof Error) {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  getBooking: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch (parseError) {
        if (parseError instanceof Error) {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  updateBooking: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch (parseError) {
        if (parseError instanceof Error) {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  // Messages
  getMessages: async (leadId?: string) => {
    const url = leadId ? `${API_BASE_URL}/messages?leadId=${leadId}` : `${API_BASE_URL}/messages`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch (parseError) {
        if (parseError instanceof Error) {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    const data = await response.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : [];
  },

  sendMessage: async (message: { leadId: string; channel: string; content: string }) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(message),
    });
    return response.json();
  },

  // AI Chat
  generateAIResponse: async (prompt: string, context?: any) => {
    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt, context }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        return errorJson;
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response. Make sure backend is running at ' + API_BASE_URL);
    }
    
    return response.json();
  },

  // Automations
  getAutomations: async () => {
    const response = await fetch(`${API_BASE_URL}/automations`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch (parseError) {
        if (parseError instanceof Error) {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    const data = await response.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : [];
  },

  toggleAutomation: async (id: number, enabled: boolean) => {
    const response = await fetch(`${API_BASE_URL}/automations/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ enabled }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    return response.json();
  },

  // Agent Activity / Audit History
  getAgentActivity: async (filters?: { dateFrom?: string; dateTo?: string; channel?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.channel) params.append('channel', filters.channel);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    else params.append('limit', '10'); // Default limit for dashboard
    
    const response = await fetch(`${API_BASE_URL}/activity?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  // Settings
  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  updateSettings: async (settings: any) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    return response.json();
  },

  syncCRM: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/sync-crm`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        return errorJson;
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    const data = await response.json();
    return data;
  },

  // Business Intelligence
  getBIDashboard: async (days: number = 30) => {
    const headers = getAuthHeaders();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      throw new Error('Not authenticated. Please log in again.');
    }
    
    console.log('[API] Fetching BI dashboard, token exists:', !!token);
    
    const response = await fetch(`${API_BASE_URL}/bi/dashboard?days=${days}`, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] BI Dashboard Error:', response.status, errorText);
      
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        throw new Error('Session expired. Please log in again.');
      }
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[API] Non-JSON response:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response. Make sure backend is running at ' + API_BASE_URL);
    }
    
    const data = await response.json();
    console.log('[API] BI Dashboard data received:', Object.keys(data));
    return data;
  },

  getInsights: async (filters?: { type?: string; is_resolved?: boolean; priority?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.is_resolved !== undefined) params.append('is_resolved', filters.is_resolved.toString());
    if (filters?.priority) params.append('priority', filters.priority);
    
    const response = await fetch(`${API_BASE_URL}/bi/insights?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    return response.json();
  },

  getMissedOpportunities: async (days: number = 7) => {
    const response = await fetch(`${API_BASE_URL}/bi/insights/missed-opportunities?days=${days}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    return response.json();
  },

  getUpsellPotential: async () => {
    const response = await fetch(`${API_BASE_URL}/bi/insights/upsell-potential`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    return response.json();
  },

  getPerformanceMetrics: async (days: number = 30) => {
    const response = await fetch(`${API_BASE_URL}/bi/metrics?days=${days}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    return response.json();
  },

  markInsightResolved: async (insightId: number) => {
    const response = await fetch(`${API_BASE_URL}/bi/insights/${insightId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    return response.json();
  },

  updateOpportunityStatus: async (opportunityId: number, status: string) => {
    const response = await fetch(`${API_BASE_URL}/bi/opportunities/${opportunityId}/update-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. ${errorText || 'Make sure backend is running at ' + API_BASE_URL}`);
      }
    }
    return response.json();
  },

  // Onboarding
  getOnboardingStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/onboarding`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  updateOnboarding: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/onboarding`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  testCrmConnection: async (apiKey: string, provider: string = 'SimplyBook.me') => {
    const response = await fetch(`${API_BASE_URL}/onboarding/test-crm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ api_key: apiKey, provider }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  // Bookings
  getBookings: async (status?: string) => {
    const url = status ? `${API_BASE_URL}/bookings?status=${status}` : `${API_BASE_URL}/bookings`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || errorJson.message || `Server error: ${response.status}`);
      } catch (parseError) {
        if (parseError instanceof Error) {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    const data = await response.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : [];
  },

  createBooking: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  getAvailability: async (serviceId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (serviceId) params.append('service_id', serviceId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `${API_BASE_URL}/bookings/availability${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  rescheduleBooking: async (bookingId: number, startTime: string, endTime?: string) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reschedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ start_time: startTime, end_time: endTime }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },

  markNoShow: async (bookingId: number) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/no-show`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        return JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}. Make sure backend is running at ${API_BASE_URL}`);
      }
    }
    return response.json();
  },
};


