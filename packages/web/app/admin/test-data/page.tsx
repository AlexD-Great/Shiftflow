'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';

interface GuestWorkflow {
  id: string;
  sessionId: string;
  name: string;
  description?: string;
  conditions: any;
  actions: any;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
}

interface AnalyticsEvent {
  id: string;
  eventType: string;
  workflowData: any;
  sessionId?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
}

interface AnalyticsStats {
  eventType: string;
  count: number;
}

export default function TestDataPage() {
  const [guestWorkflows, setGuestWorkflows] = useState<GuestWorkflow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [stats, setStats] = useState<AnalyticsStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workflows' | 'analytics'>('workflows');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch guest workflows
      const workflowsRes = await fetch('/api/guest-workflows');
      const workflowsData = await workflowsRes.json();
      setGuestWorkflows(workflowsData.guestWorkflows || []);

      // Fetch analytics
      const analyticsRes = await fetch('/api/analytics');
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.analytics || []);
      setStats(analyticsData.stats || []);
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Test Data Dashboard</h1>
          <p className="text-slate-400">View guest workflows and analytics from testers</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Guest Workflows</p>
            <p className="text-3xl font-bold text-white">{guestWorkflows.length}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Analytics Events</p>
            <p className="text-3xl font-bold text-white">{analytics.length}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Preview Generated</p>
            <p className="text-3xl font-bold text-blue-400">
              {stats.find(s => s.eventType === 'preview_generated')?.count || 0}
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Guest Saved</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.find(s => s.eventType === 'guest_saved')?.count || 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'workflows'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Guest Workflows ({guestWorkflows.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Analytics Events ({analytics.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading test data...</p>
          </div>
        ) : (
          <>
            {/* Guest Workflows Tab */}
            {activeTab === 'workflows' && (
              <div className="space-y-4">
                {guestWorkflows.length === 0 ? (
                  <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                    <p className="text-slate-400">No guest workflows yet. Share the builder link with testers!</p>
                  </div>
                ) : (
                  guestWorkflows.map((workflow) => (
                    <div key={workflow.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">{workflow.name}</h3>
                          <p className="text-sm text-slate-400">
                            Session: {workflow.sessionId.substring(0, 20)}...
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(workflow.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-300 mb-2">Conditions:</p>
                          <pre className="bg-slate-900 p-3 rounded text-xs text-slate-400 overflow-x-auto">
                            {JSON.stringify(workflow.conditions, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300 mb-2">Actions:</p>
                          <pre className="bg-slate-900 p-3 rounded text-xs text-slate-400 overflow-x-auto">
                            {JSON.stringify(workflow.actions, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {workflow.userAgent && (
                        <p className="text-xs text-slate-500">
                          User Agent: {workflow.userAgent}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {analytics.length === 0 ? (
                  <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                    <p className="text-slate-400">No analytics events yet.</p>
                  </div>
                ) : (
                  analytics.map((event) => (
                    <div key={event.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.eventType === 'preview_generated' ? 'bg-blue-900/20 text-blue-400 border border-blue-700' :
                            event.eventType === 'guest_saved' ? 'bg-green-900/20 text-green-400 border border-green-700' :
                            'bg-purple-900/20 text-purple-400 border border-purple-700'
                          }`}>
                            {event.eventType}
                          </span>
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-300 mb-2">Workflow Data:</p>
                        <pre className="bg-slate-900 p-3 rounded text-xs text-slate-400 overflow-x-auto max-h-64">
                          {JSON.stringify(event.workflowData, null, 2)}
                        </pre>
                      </div>

                      <div className="flex gap-4 text-xs text-slate-500">
                        {event.sessionId && <span>Session: {event.sessionId.substring(0, 20)}...</span>}
                        {event.userId && <span>User ID: {event.userId}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
