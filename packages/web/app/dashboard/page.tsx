'use client';

import { useState, useEffect } from 'react';
import { getExecutor } from '@/lib/workflow-executor';
import { getSafeWorkflowStatusMessage } from '@/lib/safe-workflow';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [executorStats, setExecutorStats] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Load workflows from executor
  useEffect(() => {
    const executor = getExecutor();
    const loadedWorkflows = executor.getWorkflows();
    const stats = executor.getStats();
    
    setWorkflows(loadedWorkflows);
    setExecutorStats(stats);
    setIsMonitoring(stats.isRunning);

    // Refresh every 5 seconds
    const interval = setInterval(() => {
      const updatedWorkflows = executor.getWorkflows();
      const updatedStats = executor.getStats();
      setWorkflows(updatedWorkflows);
      setExecutorStats(updatedStats);
      setIsMonitoring(updatedStats.isRunning);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStartMonitoring = () => {
    const executor = getExecutor();
    executor.start();
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    const executor = getExecutor();
    executor.stop();
    setIsMonitoring(false);
  };

  const handleRemoveWorkflow = (workflowId: string) => {
    const executor = getExecutor();
    executor.removeWorkflow(workflowId);
    setWorkflows(executor.getWorkflows());
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate workflow checks
      setWorkflows(prev => prev.map(wf => ({
        ...wf,
        lastCheckedAt: wf.status === 'active' ? new Date() : wf.lastCheckedAt,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: WorkflowStatus | ExecutionStatus) => {
    switch (status) {
      case 'active':
      case 'executing':
        return 'text-green-400 bg-green-900/20 border-green-700';
      case 'completed':
        return 'text-blue-400 bg-blue-900/20 border-blue-700';
      case 'paused':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Monitor your automated workflows in real-time</p>
          </div>
          <div className="flex gap-3">
            {isMonitoring ? (
              <button
                onClick={handleStopMonitoring}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Stop Monitoring
              </button>
            ) : (
              <button
                onClick={handleStartMonitoring}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Start Monitoring
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Workflows</span>
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`}></span>
            </div>
            <div className="text-3xl font-bold text-white">{executorStats?.total || 0}</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Pending</div>
            <div className="text-3xl font-bold text-yellow-400">{executorStats?.pending || 0}</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Executed</div>
            <div className="text-3xl font-bold text-green-400">{executorStats?.executed || 0}</div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Success Rate</div>
            <div className="text-3xl font-bold text-green-400">98.5%</div>
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
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {workflow.name}
                      </h3>
                      {workflow.safeAddress && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="px-2 py-1 bg-purple-900/20 border border-purple-700 rounded text-purple-400">
                            Safe Multi-sig
                          </span>
                          <span className="font-mono">{workflow.safeAddress}</span>
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Executions:</span>
                      <span className="text-white ml-2 font-medium">{workflow.executionCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Check:</span>
                      <span className="text-white ml-2 font-medium">
                        {workflow.lastCheckedAt ? formatTimeAgo(workflow.lastCheckedAt) : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors">
                      View Details
                    </button>
                    {workflow.status === 'active' ? (
                      <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors">
                        Pause
                      </button>
                    ) : (
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                        Resume
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Live Activity</h2>
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-slate-300">Monitoring 3 workflows</span>
                  <span className="text-slate-500 ml-auto">{currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span className="text-slate-300">Checking price oracles</span>
                  <span className="text-slate-500 ml-auto">Every 30s</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span className="text-slate-300">Safe multi-sig ready</span>
                  <span className="text-slate-500 ml-auto">1 workflow</span>
                </div>
              </div>
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
