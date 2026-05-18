'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Execution {
  id: string;
  workflowId: string;
  status: string;
  conditionsMet: boolean;
  actionResults: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
  workflow: { name: string };
  logs: Array<{ id: string; level: string; message: string; createdAt: string }>;
}

/**
 * Dashboard - Real-time workflow monitoring
 * Shows live workflow execution status and statistics
 */
export default function Dashboard() {
  const { data: session } = useSession();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [expandedExecution, setExpandedExecution] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExecutions = useCallback(async () => {
    try {
      const response = await fetch('/api/executions?limit=20');
      if (!response.ok) return;
      const data = await response.json();
      setExecutions(data.executions || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchWorkflows();
      fetchExecutions();
      const interval = setInterval(() => {
        fetchWorkflows();
        fetchExecutions();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [session, fetchWorkflows, fetchExecutions]);

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      // Refresh workflows
      await fetchWorkflows();
      setActionSuccess('Workflow deleted successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(`Error: ${err.message}`);
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleActivateWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });

      if (!response.ok) {
        throw new Error('Failed to activate workflow');
      }

      // Refresh workflows
      await fetchWorkflows();
      setActionSuccess('Workflow activated successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(`Error: ${err.message}`);
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleDeactivateWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'DRAFT' }),
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate workflow');
      }

      // Refresh workflows
      await fetchWorkflows();
      setActionSuccess('Workflow deactivated successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(`Error: ${err.message}`);
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'proposed':
        return 'text-blue-400 bg-blue-900/20 border-blue-700';
      case 'executed':
        return 'text-green-400 bg-green-900/20 border-green-700';
      case 'failed':
        return 'text-red-400 bg-red-900/20 border-red-700';
      default:
        return 'text-slate-400 bg-slate-900/20 border-slate-700';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-300 text-sm">✓ {actionSuccess}</p>
          </div>
        )}
        {actionError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">✗ {actionError}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Monitor your automated workflows</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/test-data"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
            >
              📊 Test Data
            </a>
            {!session ? (
              <div className="px-6 py-3 bg-slate-700 text-slate-400 rounded-lg">
                Sign in to view workflows
              </div>
            ) : loading ? (
              <div className="px-6 py-3 bg-slate-700 text-white rounded-lg flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              <button
                onClick={fetchWorkflows}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Workflows</span>
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>
            <div className="text-3xl font-bold text-white">{workflows.length}</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Active</div>
            <div className="text-3xl font-bold text-green-400">
              {workflows.filter(w => w.status === 'ACTIVE').length}
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Draft</div>
            <div className="text-3xl font-bold text-yellow-400">
              {workflows.filter(w => w.status === 'DRAFT').length}
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Total Executions</div>
            <div className="text-3xl font-bold text-purple-400">
              {workflows.reduce((sum, w) => sum + (w._count?.executions || 0), 0)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Workflows */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-white">Workflows</h2>
              <a
                href="/builder"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + New Workflow
              </a>
            </div>

            <div className="space-y-4">
              {!session ? (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-400">Sign in to view your workflows</p>
                </div>
              ) : loading ? (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-400">Loading workflows...</span>
                  </div>
                </div>
              ) : workflows.length === 0 ? (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-400 mb-4">No workflows yet</p>
                  <a
                    href="/builder"
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Your First Workflow
                  </a>
                </div>
              ) : (
                workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={`bg-slate-800 p-6 rounded-lg border transition-colors ${
                      workflow.status === 'ACTIVE' 
                        ? 'border-green-700 hover:border-green-600' 
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">
                            {workflow.name}
                          </h3>
                          {workflow.status === 'ACTIVE' && (
                            <span className="flex items-center gap-1 text-xs text-green-400">
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              Monitoring
                            </span>
                          )}
                        </div>
                        {workflow.description && (
                          <p className="text-sm text-slate-400">{workflow.description}</p>
                        )}
                        {workflow.safeAddress && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                            <span className="px-2 py-1 bg-purple-900/20 border border-purple-700 rounded text-purple-400">
                              Safe Multi-sig
                            </span>
                            <span className="font-mono">{workflow.safeAddress.slice(0, 10)}...</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        workflow.status === 'ACTIVE' ? 'text-green-400 bg-green-900/20 border-green-700' :
                        workflow.status === 'DRAFT' ? 'text-yellow-400 bg-yellow-900/20 border-yellow-700' :
                        'text-slate-400 bg-slate-900/20 border-slate-700'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-slate-400">Executions:</span>
                        <span className="text-white ml-2 font-medium">{workflow._count?.executions || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Created:</span>
                        <span className="text-white ml-2 font-medium">
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {workflow.status === 'DRAFT' ? (
                        <button 
                          onClick={() => handleActivateWorkflow(workflow.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                        >
                          Activate
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDeactivateWorkflow(workflow.id)}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                        >
                          Deactivate
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Execution History */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Execution History</h2>
            <div className="space-y-3">
              {!session ? (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-400">Sign in to view execution history</p>
                </div>
              ) : executions.length === 0 ? (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-400">No executions yet</p>
                  <p className="text-slate-500 text-sm mt-2">Activate a workflow to start monitoring</p>
                </div>
              ) : (
                executions.map((exec) => (
                  <div
                    key={exec.id}
                    className={`bg-slate-800 rounded-lg border transition-colors ${
                      exec.status === 'COMPLETED' ? 'border-green-800' :
                      exec.status === 'FAILED' ? 'border-red-800' :
                      exec.status === 'CONDITIONS_MET' ? 'border-blue-800' :
                      'border-slate-700'
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedExecution(expandedExecution === exec.id ? null : exec.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{exec.workflow.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(exec.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                          exec.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' :
                          exec.status === 'FAILED' ? 'bg-red-900/30 text-red-400' :
                          exec.status === 'CONDITIONS_MET' ? 'bg-blue-900/30 text-blue-400' :
                          exec.status === 'EXECUTING' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {exec.status}
                        </span>
                      </div>
                      {exec.status === 'FAILED' && exec.error && (
                        <p className="text-xs text-red-400 mt-2 truncate">{exec.error}</p>
                      )}
                      {exec.status === 'COMPLETED' && exec.actionResults && (
                        <p className="text-xs text-green-400 mt-1">
                          {Array.isArray(exec.actionResults)
                            ? `${exec.actionResults.length} action(s) completed`
                            : 'Completed'}
                        </p>
                      )}
                    </div>

                    {/* Expanded log view */}
                    {expandedExecution === exec.id && exec.logs.length > 0 && (
                      <div className="border-t border-slate-700 px-4 pb-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-3 mb-2">Execution Logs</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {exec.logs.map((log) => (
                            <div key={log.id} className="flex gap-2 text-xs">
                              <span className={`shrink-0 font-mono ${
                                log.level === 'ERROR' ? 'text-red-400' :
                                log.level === 'WARN' ? 'text-yellow-400' :
                                'text-slate-400'
                              }`}>
                                {log.level.slice(0, 1)}
                              </span>
                              <span className="text-slate-300 break-all">{log.message}</span>
                            </div>
                          ))}
                        </div>
                        {exec.actionResults && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Results</p>
                            <pre className="text-xs text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto max-h-32">
                              {JSON.stringify(exec.actionResults, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
