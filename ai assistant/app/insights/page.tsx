'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { 
  FiTrendingUp, 
  FiAlertCircle, 
  FiDollarSign, 
  FiUsers, 
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTarget
} from 'react-icons/fi';

interface Insight {
  id: number;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  lead?: {
    id: number;
    name: string;
    email: string;
  };
  metric_value?: number;
  metric_label?: string;
  action_items?: string[];
  is_resolved: boolean;
  created_at: string;
}

interface Opportunity {
  id: number;
  type: string;
  status: string;
  title: string;
  description: string;
  confidence_score: number;
  lead: {
    id: number;
    name: string;
    email: string;
  };
  estimated_value?: number;
  created_at: string;
}

interface DashboardData {
  summary: {
    total_leads: number;
    converted_leads: number;
    qualified_leads: number;
    new_leads: number;
    conversion_rate: number;
    total_activities: number;
    active_opportunities: number;
    unresolved_insights: number;
  };
  insights: Insight[];
  opportunities: Opportunity[];
  activity_breakdown: Array<{ type: string; count: number }>;
  lead_status_distribution: Array<{ status: string; count: number }>;
  insights_by_type: Array<{ type: string; count: number }>;
}

export default function InsightsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysFilter, setDaysFilter] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [daysFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    // Add timeout to prevent infinite loading
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Request timeout: Backend server may not be running. Please check if the server is running at http://localhost:8000'));
      }, 10000); // 10 second timeout
    });
    
    try {
      console.log('[Insights] Fetching BI dashboard data...');
      console.log('[Insights] Days filter:', daysFilter);
      console.log('[Insights] Token exists:', typeof window !== 'undefined' ? !!localStorage.getItem('token') : 'N/A');
      console.log('[Insights] API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');
      
      const data = await Promise.race([
        api.getBIDashboard(daysFilter),
        timeoutPromise
      ]) as any;
      
      clearTimeout(timeoutId!);
      
      console.log('[Insights] BI Dashboard Data received:', data); // Debug log
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Ensure data has required structure
      if (!data.summary) {
        console.warn('Response missing summary, creating default structure');
        setDashboardData({
          summary: {
            total_leads: data.total_leads || 0,
            converted_leads: data.converted_leads || 0,
            qualified_leads: data.qualified_leads || 0,
            new_leads: data.new_leads || 0,
            conversion_rate: data.conversion_rate || 0,
            total_activities: data.total_activities || 0,
            active_opportunities: data.active_opportunities || 0,
            unresolved_insights: data.unresolved_insights || 0,
          },
          insights: data.insights || [],
          opportunities: data.opportunities || [],
          activity_breakdown: data.activity_breakdown || [],
          lead_status_distribution: data.lead_status_distribution || [],
          insights_by_type: data.insights_by_type || [],
        });
      } else {
        setDashboardData(data);
      }
    } catch (err: any) {
      if (timeoutId!) clearTimeout(timeoutId!);
      console.error('[Insights] Error fetching BI dashboard:', err);
      const errorMessage = err.message || 'Failed to load insights';
      setError(errorMessage);
      
      // If authentication error, suggest login
      if (errorMessage.includes('authenticated') || errorMessage.includes('Session expired') || errorMessage.includes('401')) {
        setError(`${errorMessage}. Redirecting to login...`);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }, 3000);
      }
      
      // Show error in console for debugging
      console.error('[Insights] Full error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveInsight = async (insightId: number) => {
    try {
      await api.markInsightResolved(insightId);
      fetchDashboardData(); // Refresh data
    } catch (err: any) {
      console.error('Error resolving insight:', err);
      alert('Failed to resolve insight: ' + err.message);
    }
  };

  const handleUpdateOpportunity = async (opportunityId: number, status: string) => {
    try {
      await api.updateOpportunityStatus(opportunityId, status);
      fetchDashboardData(); // Refresh data
    } catch (err: any) {
      console.error('Error updating opportunity:', err);
      alert('Failed to update opportunity: ' + err.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'missed_opportunity': return <FiClock className="w-5 h-5" />;
      case 'upsell_potential': return <FiDollarSign className="w-5 h-5" />;
      case 'conversion_risk': return <FiAlertCircle className="w-5 h-5" />;
      default: return <FiTarget className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <div className="text-gray-500">Loading insights...</div>
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (error && !dashboardData) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Insights</h3>
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <p>Common issues:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Make sure the backend server is running (python manage.py runserver)</li>
              <li>Check if you're logged in</li>
              <li>Check browser console (F12) for more details</li>
            </ul>
          </div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="text-gray-500">No data available</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Intelligence</h1>
            <p className="text-gray-600 mt-1">Insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.summary.conversion_rate}%
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {dashboardData.summary.converted_leads} of {dashboardData.summary.total_leads} leads
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Opportunities</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.summary.active_opportunities}
                </p>
              </div>
              <FiTarget className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Potential revenue opportunities
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unresolved Insights</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.summary.unresolved_insights}
                </p>
              </div>
              <FiAlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Action items requiring attention
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.summary.total_activities}
                </p>
              </div>
              <FiUsers className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Agent actions in period
            </p>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Key Insights</h2>
            <p className="text-sm text-gray-600 mt-1">Actionable insights based on agent activities</p>
          </div>
          <div className="p-6 space-y-4">
            {dashboardData.insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No insights available for this period
              </div>
            ) : (
              dashboardData.insights.map((insight) => (
                <div
                  key={insight.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(insight.type)}
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
                      {insight.lead && (
                        <p className="text-xs text-gray-500 mb-2">
                          Lead: {insight.lead.name} ({insight.lead.email})
                        </p>
                      )}
                      {insight.metric_value && insight.metric_label && (
                        <p className="text-xs text-gray-500">
                          {insight.metric_label}: {insight.metric_value}
                        </p>
                      )}
                      {insight.action_items && insight.action_items.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Action Items:</p>
                          <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                            {insight.action_items.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {!insight.is_resolved && (
                      <button
                        onClick={() => handleResolveInsight(insight.id)}
                        className="ml-4 px-3 py-1 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Opportunities Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Upsell Opportunities</h2>
            <p className="text-sm text-gray-600 mt-1">Potential revenue opportunities identified</p>
          </div>
          <div className="p-6 space-y-4">
            {dashboardData.opportunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No opportunities identified at this time
              </div>
            ) : (
              dashboardData.opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FiDollarSign className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {opp.type}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                          {opp.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{opp.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Lead: {opp.lead.name}</span>
                        <span>Confidence: {opp.confidence_score}%</span>
                        {opp.estimated_value && (
                          <span className="font-semibold text-green-600">
                            Est. Value: ${opp.estimated_value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {opp.status === 'identified' && (
                        <>
                          <button
                            onClick={() => handleUpdateOpportunity(opp.id, 'in_progress')}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => handleUpdateOpportunity(opp.id, 'converted')}
                            className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Convert
                          </button>
                        </>
                      )}
                      {opp.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateOpportunity(opp.id, 'converted')}
                          className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Mark Converted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
            <div className="space-y-3">
              {dashboardData.activity_breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
            <div className="space-y-3">
              {dashboardData.lead_status_distribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

