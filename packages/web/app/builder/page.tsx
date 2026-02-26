'use client';

import { useState, useEffect } from 'react';
import { usePriceOracle } from '@/hooks/usePriceOracle';
import { formatPrice, formatPriceChange } from '@/lib/price-oracle';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type ConditionType = 'PRICE_THRESHOLD' | 'GAS_THRESHOLD' | 'TIME_BASED' | 'COMPOSITE_AND' | 'COMPOSITE_OR';
type ActionType = 'CROSS_CHAIN_SWAP' | 'NOTIFICATION' | 'WEBHOOK' | 'MULTI_STEP';
type PriorityType = 'REQUIRED' | 'PREFERRED';

export default function WorkflowBuilder() {
  const router = useRouter();
  const { data: session } = useSession();
  const [workflowName, setWorkflowName] = useState('');
  const [conditionType, setConditionType] = useState<ConditionType>('PRICE_THRESHOLD');
  const [actionType, setActionType] = useState<ActionType>('CROSS_CHAIN_SWAP');
  const [useSafe, setUseSafe] = useState(false);
  const [safeAddress, setSafeAddress] = useState('');
  const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showGuestSave, setShowGuestSave] = useState(false);
  const [isSavingGuest, setIsSavingGuest] = useState(false);
  const [workflowPreview, setWorkflowPreview] = useState<string>('');

  // Generate or retrieve session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sid = localStorage.getItem('shiftflow_session_id');
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('shiftflow_session_id', sid);
      }
      setSessionId(sid);
    }
  }, []);

  // Load template from localStorage on mount
  useEffect(() => {
    const templateData = localStorage.getItem('selectedTemplate');
    if (templateData) {
      try {
        const template = JSON.parse(templateData);
        // Populate form with template data
        setWorkflowName(template.name);
        
        // Map template condition type to our condition types
        if (template.condition.type === 'Price Threshold') {
          setConditionType('PRICE_THRESHOLD');
        } else if (template.condition.type === 'Gas Threshold') {
          setConditionType('GAS_THRESHOLD');
        } else if (template.condition.type === 'Time-Based') {
          setConditionType('TIME_BASED');
        }
        
        // Map template action type to our action types
        if (template.action.type === 'Cross-Chain Swap') {
          setActionType('CROSS_CHAIN_SWAP');
        } else if (template.action.type === 'Notification') {
          setActionType('NOTIFICATION');
        } else if (template.action.type === 'Webhook') {
          setActionType('WEBHOOK');
        } else if (template.action.type === 'Multi-Step') {
          setActionType('MULTI_STEP');
        }
        
        // Clear the template from localStorage after loading
        localStorage.removeItem('selectedTemplate');
        
        // Show success message
        setDeployStatus('success');
        setStatusMessage(`Template "${template.name}" loaded successfully!`);
        setTimeout(() => setDeployStatus('idle'), 3000);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    }
  }, []);

  // Price condition state
  const [token, setToken] = useState('ETH');
  const [comparison, setComparison] = useState<'above' | 'below'>('below');
  const [threshold, setThreshold] = useState('3000');

  // Fetch live prices
  const { prices, loading: pricesLoading } = usePriceOracle(['ETH', 'BTC', 'USDT', 'USDC', 'SOL', 'MATIC']);

  // Gas condition state
  const [gasNetwork, setGasNetwork] = useState('ethereum');
  const [gasComparison, setGasComparison] = useState<'above' | 'below'>('below');
  const [gasThreshold, setGasThreshold] = useState('20');
  const [timeSchedule, setTimeSchedule] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [includeSecondaryCondition, setIncludeSecondaryCondition] = useState(true);
  const [secondaryConditionPriority, setSecondaryConditionPriority] = useState<PriorityType>('PREFERRED');

  // Swap action state
  const [depositCoin, setDepositCoin] = useState('eth');
  const [depositNetwork, setDepositNetwork] = useState('arbitrum');
  const [settleCoin, setSettleCoin] = useState('btc');
  const [settleNetwork, setSettleNetwork] = useState('bitcoin');
  const [amount, setAmount] = useState('0.01');
  const [settleAddress, setSettleAddress] = useState('');

  // Notification action state
  const [notificationTitle, setNotificationTitle] = useState('Workflow Executed');
  const [notificationMessage, setNotificationMessage] = useState('Your workflow has been executed successfully');
  const [notificationEmail, setNotificationEmail] = useState('');

  // Webhook action state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookMethod, setWebhookMethod] = useState<'POST' | 'GET'>('POST');
  const [webhookBody, setWebhookBody] = useState('{}');

  // Generate preview on mount and when key fields change
  useEffect(() => {
    const preview = generateWorkflowPreview();
    setWorkflowPreview(preview);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowName, conditionType, actionType, token, comparison, threshold, gasNetwork, gasComparison, gasThreshold, timeSchedule, includeSecondaryCondition, secondaryConditionPriority, depositCoin, settleCoin, amount]);

  const isCompositeCondition = conditionType === 'COMPOSITE_AND' || conditionType === 'COMPOSITE_OR';

  const buildPriceCondition = () => ({
    type: 'PRICE_THRESHOLD',
    token,
    comparison,
    threshold: parseFloat(threshold),
    currency: 'USD',
  });

  const buildGasCondition = () => ({
    type: 'GAS_THRESHOLD',
    network: gasNetwork,
    comparison: gasComparison,
    threshold: parseFloat(gasThreshold),
  });

  const buildConditionsPayload = () => {
    if (isCompositeCondition) {
      const childConditions: Array<Record<string, unknown>> = [
        {
          ...buildPriceCondition(),
          priority: 'REQUIRED',
          required: true,
        },
      ];

      if (includeSecondaryCondition) {
        childConditions.push({
          ...buildGasCondition(),
          priority: secondaryConditionPriority,
          required: secondaryConditionPriority === 'REQUIRED',
        });
      }

      return [
        {
          type: 'COMPOSITE',
          operator: conditionType === 'COMPOSITE_AND' ? 'AND' : 'OR',
          conditionType,
          conditions: childConditions,
        },
      ];
    }

    if (conditionType === 'PRICE_THRESHOLD') {
      return [buildPriceCondition()];
    }

    if (conditionType === 'GAS_THRESHOLD') {
      return [buildGasCondition()];
    }

    return [{ type: 'TIME_BASED', schedule: timeSchedule }];
  };

  const getConditionSummary = () => {
    if (conditionType === 'PRICE_THRESHOLD') {
      return `${token} price is ${comparison} $${threshold}`;
    }

    if (conditionType === 'GAS_THRESHOLD') {
      return `${gasNetwork} gas is ${gasComparison} ${gasThreshold} gwei`;
    }

    if (conditionType === 'TIME_BASED') {
      return `Run on ${timeSchedule} schedule`;
    }

    const operatorLabel = conditionType === 'COMPOSITE_AND' ? 'AND' : 'OR';
    const gasClause = includeSecondaryCondition
      ? ` ${operatorLabel} ${gasNetwork} gas is ${gasComparison} ${gasThreshold} gwei (${secondaryConditionPriority === 'REQUIRED' ? 'must-have' : 'optional'})`
      : '';

    return `${token} price is ${comparison} $${threshold}${gasClause}`;
  };


  const parseWebhookBody = () => {
    try {
      return JSON.parse(webhookBody || '{}');
    } catch {
      throw new Error('Webhook body must be valid JSON');
    }
  };

  const getActionSummary = () => {
    if (actionType === 'CROSS_CHAIN_SWAP') {
      return `Swap ${amount} ${depositCoin} (${depositNetwork}) → ${settleCoin} (${settleNetwork})`;
    }

    if (actionType === 'NOTIFICATION') {
      return `Send notification: ${notificationTitle}`;
    }

    if (actionType === 'WEBHOOK') {
      return `Call webhook (${webhookMethod}) ${webhookUrl || 'URL not set'}`;
    }

    return 'Execute multi-step flow (coming soon)';
  };

  const generateWorkflowPreview = () => {
    const workflow = {
      name: workflowName || 'Untitled Workflow',
      description: `Auto-generated workflow`,
      condition: buildConditionsPayload()[0],
      actions: [
        {
          type: actionType,
          ...(actionType === 'CROSS_CHAIN_SWAP' && {
            depositCoin,
            depositNetwork,
            settleCoin,
            settleNetwork,
            amount,
            settleAddress,
          }),
          ...(actionType === 'NOTIFICATION' && {
            title: notificationTitle,
            message: notificationMessage,
            email: notificationEmail,
          }),
          ...(actionType === 'WEBHOOK' && {
            url: webhookUrl,
            method: webhookMethod,
            body: parseWebhookBody(),
          }),
        },
      ],
      status: 'ACTIVE',
      ...(useSafe && { safeAddress, requiresApproval: true }),
    };

    return JSON.stringify(workflow, null, 2);
  };

  // Track analytics event (only on client side)
  const trackAnalytics = async (eventType: string, workflowData: any) => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          workflowData,
          sessionId,
          userId: session?.user ? (session.user as any).id : undefined,
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  // Track preview generation when preview changes
  useEffect(() => {
    if (workflowPreview && sessionId) {
      try {
        const workflowData = JSON.parse(workflowPreview);
        trackAnalytics('preview_generated', workflowData);
        
        // Show guest save option if not logged in
        if (!session) {
          setShowGuestSave(true);
        }
      } catch (error) {
        // Ignore parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowPreview, sessionId, session]);

  // Save workflow as guest
  const handleGuestSave = async () => {
    if (!workflowName.trim()) {
      setDeployStatus('error');
      setStatusMessage('Please enter a workflow name');
      setTimeout(() => setDeployStatus('idle'), 3000);
      return;
    }

    setIsSavingGuest(true);

    try {
      const workflowData = {
        name: workflowName,
        description: `Auto-generated workflow`,
        conditions: buildConditionsPayload(),
        actions: [
          {
            type: actionType,
            ...(actionType === 'CROSS_CHAIN_SWAP' && {
              depositCoin,
              depositNetwork,
              settleCoin,
              settleNetwork,
              amount: parseFloat(amount),
              settleAddress,
            }),
            ...(actionType === 'NOTIFICATION' && {
              title: notificationTitle,
              message: notificationMessage,
              email: notificationEmail,
            }),
            ...(actionType === 'WEBHOOK' && {
              url: webhookUrl,
              method: webhookMethod,
              body: parseWebhookBody(),
            }),
          },
        ],
      };

      const response = await fetch('/api/guest-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...workflowData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save workflow');
      }

      // Track guest save
      trackAnalytics('guest_saved', workflowData);

      setDeployStatus('success');
      setStatusMessage('✅ Workflow saved! Thank you for testing. Sign in to activate it.');
      setShowGuestSave(false);
      setTimeout(() => setDeployStatus('idle'), 5000);
    } catch (error) {
      console.error('Error saving guest workflow:', error);
      setDeployStatus('error');
      setStatusMessage('Failed to save workflow. Please try again.');
      setTimeout(() => setDeployStatus('idle'), 3000);
    } finally {
      setIsSavingGuest(false);
    }
  };

  const handleDeploy = async () => {
    // Validate required fields
    if (!workflowName.trim()) {
      setDeployStatus('error');
      setStatusMessage('Please enter a workflow name');
      setTimeout(() => setDeployStatus('idle'), 3000);
      return;
    }

    if (actionType === 'CROSS_CHAIN_SWAP' && !settleAddress.trim()) {
      setDeployStatus('error');
      setStatusMessage('Please enter a settle address for the swap');
      setTimeout(() => setDeployStatus('idle'), 3000);
      return;
    }

    if (actionType === 'WEBHOOK') {
      try {
        parseWebhookBody();
      } catch (error) {
        setDeployStatus('error');
        setStatusMessage((error as Error).message);
        setTimeout(() => setDeployStatus('idle'), 3000);
        return;
      }
    }

    if (useSafe && !safeAddress.trim()) {
      setDeployStatus('error');
      setStatusMessage('Please enter your Safe address');
      setTimeout(() => setDeployStatus('idle'), 3000);
      return;
    }

    if (!session) {
      setDeployStatus('error');
      setStatusMessage('Please sign in to create workflows');
      setTimeout(() => setDeployStatus('idle'), 3000);
      return;
    }

    setIsDeploying(true);

    try {
      // Create workflow object
      const workflowData = {
        name: workflowName,
        description: `Auto-generated workflow`,
        conditions: buildConditionsPayload(),
        actions: [
          {
            type: actionType,
            ...(actionType === 'CROSS_CHAIN_SWAP' && {
              depositCoin,
              depositNetwork,
              settleCoin,
              settleNetwork,
              amount: parseFloat(amount),
              settleAddress,
            }),
            ...(actionType === 'NOTIFICATION' && {
              title: notificationTitle,
              message: notificationMessage,
              email: notificationEmail,
            }),
            ...(actionType === 'WEBHOOK' && {
              url: webhookUrl,
              method: webhookMethod,
              body: parseWebhookBody(),
            }),
          },
        ],
        ...(useSafe && { safeAddress }),
      };

      // Save to database via API
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create workflow');
      }

      const workflow = await response.json();

      // Show success message
      setDeployStatus('success');
      setStatusMessage('Workflow created successfully! Redirecting to Dashboard...');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to deploy workflow:', error);
      setDeployStatus('error');
      setStatusMessage(error.message || 'Failed to deploy workflow. Please try again.');
      setTimeout(() => setDeployStatus('idle'), 3000);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSaveDraft = () => {
    if (!workflowName.trim()) {
      setDeployStatus('error');
      setStatusMessage('Please enter a workflow name to save');
      setTimeout(() => setDeployStatus('idle'), 3000);
      return;
    }

    // Simulate saving (in production, this would save to local storage or API)
    setDeployStatus('success');
    setStatusMessage('Workflow saved as draft! You can edit it later.');
    
    setTimeout(() => {
      setDeployStatus('idle');
      setStatusMessage('');
    }, 5000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Workflow Builder</h1>
          <p className="text-sm sm:text-base text-slate-400">Create automated cross-chain workflows</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Builder Form */}
          <div className="space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="e.g., DeFi Sniper"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={useSafe}
                      onChange={(e) => setUseSafe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                    />
                    <span>Execute through Safe (Multi-sig)</span>
                  </label>
                </div>

                {useSafe && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Safe Address
                    </label>
                    <input
                      type="text"
                      value={safeAddress}
                      onChange={(e) => setSafeAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Condition */}
            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Condition (When)</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Condition Type
                  </label>
                  <select
                    value={conditionType}
                    onChange={(e) => setConditionType(e.target.value as ConditionType)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="PRICE_THRESHOLD">Price Threshold</option>
                    <option value="GAS_THRESHOLD">Gas Price Threshold</option>
                    <option value="TIME_BASED">Time Based</option>
                    <option value="COMPOSITE_AND">Multiple (AND)</option>
                    <option value="COMPOSITE_OR">Multiple (OR)</option>
                  </select>
                </div>

                {conditionType === 'GAS_THRESHOLD' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Network
                        </label>
                        <select
                          value={gasNetwork}
                          onChange={(e) => setGasNetwork(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="ethereum">Ethereum</option>
                          <option value="polygon">Polygon</option>
                          <option value="arbitrum">Arbitrum</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Comparison
                        </label>
                        <select
                          value={gasComparison}
                          onChange={(e) => setGasComparison(e.target.value as 'above' | 'below')}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="below">Below</option>
                          <option value="above">Above</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Threshold (gwei)
                      </label>
                      <input
                        type="number"
                        value={gasThreshold}
                        onChange={(e) => setGasThreshold(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Typical: Ethereum 20-50 gwei, Polygon 30-100 gwei, Arbitrum 0.1-1 gwei
                      </p>
                    </div>
                  </>
                )}

                {conditionType === 'TIME_BASED' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Schedule
                      </label>
                      <select
                        value={timeSchedule}
                        onChange={(e) => setTimeSchedule(e.target.value as 'hourly' | 'daily' | 'weekly' | 'monthly')}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Every Day</option>
                        <option value="weekly">Every Week</option>
                        <option value="monthly">Every Month</option>
                      </select>
                    </div>
                    <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        💡 Time-based workflows execute on a schedule regardless of market conditions
                      </p>
                    </div>
                  </>
                )}



                {isCompositeCondition && (
                  <>
                    <div className="p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
                      <p className="text-purple-300 text-sm">
                        💡 Combine a primary price trigger with an optional gas preference. Set gas as required or optional based on execution priority.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Primary Token
                        </label>
                        <select
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="BTC">BTC - Bitcoin</option>
                          <option value="ETH">ETH - Ethereum</option>
                          <option value="BNB">BNB - Binance Coin</option>
                          <option value="SOL">SOL - Solana</option>
                          <option value="XRP">XRP - Ripple</option>
                          <option value="ADA">ADA - Cardano</option>
                          <option value="AVAX">AVAX - Avalanche</option>
                          <option value="DOT">DOT - Polkadot</option>
                          <option value="MATIC">MATIC - Polygon</option>
                          <option value="LINK">LINK - Chainlink</option>
                          <option value="UNI">UNI - Uniswap</option>
                          <option value="ATOM">ATOM - Cosmos</option>
                          <option value="USDT">USDT - Tether</option>
                          <option value="USDC">USDC - USD Coin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Primary Comparison
                        </label>
                        <select
                          value={comparison}
                          onChange={(e) => setComparison(e.target.value as 'above' | 'below')}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="below">Below</option>
                          <option value="above">Above</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Primary Threshold (USD)
                      </label>
                      <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSecondaryCondition}
                        onChange={(e) => setIncludeSecondaryCondition(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
                      />
                      <span className="text-slate-300 text-sm">Add gas condition as secondary rule</span>
                    </label>

                    {includeSecondaryCondition && (
                      <div className="space-y-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Gas Network</label>
                            <select
                              value={gasNetwork}
                              onChange={(e) => setGasNetwork(e.target.value)}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="ethereum">Ethereum</option>
                              <option value="polygon">Polygon</option>
                              <option value="arbitrum">Arbitrum</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Gas Comparison</label>
                            <select
                              value={gasComparison}
                              onChange={(e) => setGasComparison(e.target.value as 'above' | 'below')}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="below">Below</option>
                              <option value="above">Above</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Gas Threshold (gwei)</label>
                            <input
                              type="number"
                              value={gasThreshold}
                              onChange={(e) => setGasThreshold(e.target.value)}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Priority</label>
                            <select
                              value={secondaryConditionPriority}
                              onChange={(e) => setSecondaryConditionPriority(e.target.value as PriorityType)}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="PREFERRED">Preferred (nice-to-have)</option>
                              <option value="REQUIRED">Required (must-have)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {conditionType === 'PRICE_THRESHOLD' && (
                  <>
                    {/* Live Price Display */}
                    {!pricesLoading && prices[token] && (
                      <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-400 text-sm">Current {token} Price</p>
                            <p className="text-white text-2xl font-bold mt-1">
                              {formatPrice(prices[token].price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-sm">24h Change</p>
                            <p className={`text-lg font-semibold mt-1 ${
                              prices[token].change24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatPriceChange(prices[token].change24h).text}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Live data • Updates every 60s
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Token
                        </label>
                        <select
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="BTC">BTC - Bitcoin</option>
                          <option value="ETH">ETH - Ethereum</option>
                          <option value="BNB">BNB - Binance Coin</option>
                          <option value="SOL">SOL - Solana</option>
                          <option value="XRP">XRP - Ripple</option>
                          <option value="ADA">ADA - Cardano</option>
                          <option value="AVAX">AVAX - Avalanche</option>
                          <option value="DOT">DOT - Polkadot</option>
                          <option value="MATIC">MATIC - Polygon</option>
                          <option value="LINK">LINK - Chainlink</option>
                          <option value="UNI">UNI - Uniswap</option>
                          <option value="ATOM">ATOM - Cosmos</option>
                          <option value="USDT">USDT - Tether</option>
                          <option value="USDC">USDC - USD Coin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Comparison
                        </label>
                        <select
                          value={comparison}
                          onChange={(e) => setComparison(e.target.value as 'above' | 'below')}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="below">Below</option>
                          <option value="above">Above</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Threshold (USD)
                      </label>
                      <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      {prices[token] && (
                        <p className="text-xs text-slate-400 mt-2">
                          Current price: {formatPrice(prices[token].price)} • 
                          Trigger when {comparison} ${threshold}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Action (Then)</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Action Type
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as ActionType)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="CROSS_CHAIN_SWAP">Cross-Chain Swap</option>
                    <option value="NOTIFICATION">Send Notification</option>
                    <option value="WEBHOOK">Call Webhook</option>
                    <option value="MULTI_STEP">Multi-Step</option>
                  </select>
                </div>

                {actionType === 'CROSS_CHAIN_SWAP' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          From Coin
                        </label>
                        <select
                          value={depositCoin}
                          onChange={(e) => setDepositCoin(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="eth">ETH - Ethereum</option>
                          <option value="btc">BTC - Bitcoin</option>
                          <option value="usdt">USDT - Tether</option>
                          <option value="usdc">USDC - USD Coin</option>
                          <option value="bnb">BNB - Binance Coin</option>
                          <option value="sol">SOL - Solana</option>
                          <option value="matic">MATIC - Polygon</option>
                          <option value="avax">AVAX - Avalanche</option>
                          <option value="ada">ADA - Cardano</option>
                          <option value="dot">DOT - Polkadot</option>
                          <option value="xrp">XRP - Ripple</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          From Network
                        </label>
                        <select
                          value={depositNetwork}
                          onChange={(e) => setDepositNetwork(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="ethereum">Ethereum Mainnet</option>
                          <option value="arbitrum">Arbitrum</option>
                          <option value="optimism">Optimism</option>
                          <option value="polygon">Polygon</option>
                          <option value="base">Base</option>
                          <option value="bsc">Binance Smart Chain</option>
                          <option value="avalanche">Avalanche C-Chain</option>
                          <option value="bitcoin">Bitcoin</option>
                          <option value="solana">Solana</option>
                          <option value="cardano">Cardano</option>
                          <option value="polkadot">Polkadot</option>
                          <option value="ripple">Ripple</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          To Coin
                        </label>
                        <select
                          value={settleCoin}
                          onChange={(e) => setSettleCoin(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="eth">ETH - Ethereum</option>
                          <option value="btc">BTC - Bitcoin</option>
                          <option value="usdt">USDT - Tether</option>
                          <option value="usdc">USDC - USD Coin</option>
                          <option value="bnb">BNB - Binance Coin</option>
                          <option value="sol">SOL - Solana</option>
                          <option value="matic">MATIC - Polygon</option>
                          <option value="avax">AVAX - Avalanche</option>
                          <option value="ada">ADA - Cardano</option>
                          <option value="dot">DOT - Polkadot</option>
                          <option value="xrp">XRP - Ripple</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          To Network
                        </label>
                        <select
                          value={settleNetwork}
                          onChange={(e) => setSettleNetwork(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="ethereum">Ethereum Mainnet</option>
                          <option value="arbitrum">Arbitrum</option>
                          <option value="optimism">Optimism</option>
                          <option value="polygon">Polygon</option>
                          <option value="base">Base</option>
                          <option value="bsc">Binance Smart Chain</option>
                          <option value="avalanche">Avalanche C-Chain</option>
                          <option value="bitcoin">Bitcoin</option>
                          <option value="solana">Solana</option>
                          <option value="cardano">Cardano</option>
                          <option value="polkadot">Polkadot</option>
                          <option value="ripple">Ripple</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Amount
                      </label>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Settle Address
                      </label>
                      <input
                        type="text"
                        value={settleAddress}
                        onChange={(e) => setSettleAddress(e.target.value)}
                        placeholder="Destination address"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {actionType === 'NOTIFICATION' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notification Title
                      </label>
                      <input
                        type="text"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                        placeholder="e.g., Workflow Executed"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Message
                      </label>
                      <textarea
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        placeholder="Notification message..."
                        rows={4}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Receive email alerts when workflow conditions are met
                      </p>
                    </div>
                    <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        💡 Notifications will be sent when the workflow executes (in-app + email if provided)
                      </p>
                    </div>
                  </>
                )}

                {actionType === 'WEBHOOK' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-api.com/webhook"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Method
                      </label>
                      <select
                        value={webhookMethod}
                        onChange={(e) => setWebhookMethod(e.target.value as 'POST' | 'GET')}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Request Body (JSON)
                      </label>
                      <textarea
                        value={webhookBody}
                        onChange={(e) => setWebhookBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        rows={4}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                      />
                    </div>
                    <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        💡 This will call your webhook URL when the workflow executes
                      </p>
                    </div>
                  </>
                )}

                {actionType === 'MULTI_STEP' && (
                  <div className="p-6 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-300 text-sm mb-2">
                      🚧 Multi-step workflows are coming soon!
                    </p>
                    <p className="text-slate-400 text-sm">
                      This feature will allow you to chain multiple actions together (e.g., swap → notify → webhook).
                      For now, please use single-action workflows.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Workflow Preview</h2>
              
              <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>When:</strong>{' '}
                  {getConditionSummary()}
                  {useSafe && ' (via Safe multi-sig)'}
                </p>
                <p className="text-blue-300 text-sm mt-2">
                  <strong>Then:</strong> {getActionSummary()}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Workflow Preview</h3>
                <pre className="bg-slate-900 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto max-h-96">
                  {workflowPreview}
                </pre>
              </div>

              {/* Guest Save Option */}
              {showGuestSave && !session && (
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-blue-300 text-sm mb-3">
                    💡 <strong>Testing ShiftFlow?</strong> Save your workflow to help us improve!
                  </p>
                  <button 
                    onClick={handleGuestSave}
                    disabled={isSavingGuest}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {isSavingGuest ? 'Saving...' : '💾 Save Test Workflow (No Sign-In Required)'}
                  </button>
                  <p className="text-xs text-slate-400 mt-2">
                    Your workflow will be saved anonymously for testing feedback.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying || !session}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isDeploying ? 'Creating...' : session ? 'Create Workflow' : 'Sign In to Create'}
                </button>
                <button 
                  onClick={handleSaveDraft}
                  className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Save as Draft
                </button>
              </div>

              {/* Status Message */}
              {deployStatus !== 'idle' && (
                <div className={`mt-4 p-4 rounded-lg ${
                  deployStatus === 'success' 
                    ? 'bg-green-900/20 border border-green-700' 
                    : 'bg-red-900/20 border border-red-700'
                }`}>
                  <p className={`text-sm ${
                    deployStatus === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {deployStatus === 'success' ? '✅ ' : '❌ '}
                    {statusMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mt-4 sm:mt-6 bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Available Features</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>✅ Smart Account (Safe) integration</li>
                <li>✅ Multi-condition workflows (AND/OR)</li>
                <li>🚧 Multi-step actions (coming soon)</li>
                <li>✅ Price-based triggers</li>
                <li>✅ Gas price optimization</li>
                <li>✅ Time-based scheduling</li>
                <li>✅ Notifications & webhooks</li>
              </ul>
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
