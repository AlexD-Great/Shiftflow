'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  condition: {
    type: string;
    description: string;
  };
  action: {
    type: string;
    description: string;
  };
  useCase: string;
  estimatedGas: string;
  popularity: number;
}

const templates: Template[] = [
  {
    id: 'defi-sniper',
    name: 'DeFi Sniper',
    category: 'Trading',
    description: 'Automatically buy the dip when prices drop below your target',
    icon: '🎯',
    difficulty: 'Beginner',
    condition: {
      type: 'Price Threshold',
      description: 'When ETH price drops below $3,000',
    },
    action: {
      type: 'Cross-Chain Swap',
      description: 'Swap 1 ETH (Arbitrum) → BTC (Bitcoin)',
    },
    useCase: 'Perfect for catching market dips without constant monitoring',
    estimatedGas: '~$5-10',
    popularity: 95,
  },
  {
    id: 'profit-taker',
    name: 'Profit Taker',
    category: 'Trading',
    description: 'Lock in profits automatically when prices reach your target',
    icon: '💰',
    difficulty: 'Beginner',
    condition: {
      type: 'Price Threshold',
      description: 'When BTC price rises above $100,000',
    },
    action: {
      type: 'Cross-Chain Swap',
      description: 'Swap 0.5 BTC (Bitcoin) → USDC (Arbitrum)',
    },
    useCase: 'Secure profits during bull runs without emotional trading',
    estimatedGas: '~$8-15',
    popularity: 92,
  },
  {
    id: 'treasury-rebalance',
    name: 'Treasury Rebalancer',
    category: 'Portfolio',
    description: 'Maintain target portfolio allocation automatically',
    icon: '⚖️',
    difficulty: 'Intermediate',
    condition: {
      type: 'Multi-Condition (AND)',
      description: 'When BTC > $95k AND portfolio BTC > 60%',
    },
    action: {
      type: 'Multi-Step',
      description: 'Swap BTC → USDC, then notify via Telegram',
    },
    useCase: 'Ideal for DAOs and treasury management',
    estimatedGas: '~$10-20',
    popularity: 88,
  },
  {
    id: 'gas-optimizer',
    name: 'Gas Optimizer',
    category: 'Cost Saving',
    description: 'Execute swaps only when gas prices are low',
    icon: '⛽',
    difficulty: 'Intermediate',
    condition: {
      type: 'Multi-Condition (AND)',
      description: 'When gas < 20 gwei AND ETH price < $3,200',
    },
    action: {
      type: 'Cross-Chain Swap',
      description: 'Swap 2 ETH (Ethereum) → USDC (Polygon)',
    },
    useCase: 'Save on transaction fees during low-activity periods',
    estimatedGas: '~$3-8',
    popularity: 85,
  },
  {
    id: 'dca-strategy',
    name: 'DCA Strategy',
    category: 'Investment',
    description: 'Dollar-cost average into crypto automatically',
    icon: '📈',
    difficulty: 'Beginner',
    condition: {
      type: 'Time-Based',
      description: 'Every Monday at 9:00 AM UTC',
    },
    action: {
      type: 'Cross-Chain Swap',
      description: 'Swap $100 USDC (Arbitrum) → BTC (Bitcoin)',
    },
    useCase: 'Build positions over time without timing the market',
    estimatedGas: '~$5-10',
    popularity: 90,
  },
  {
    id: 'safe-multisig',
    name: 'Safe Multi-Sig Workflow',
    category: 'Security',
    description: 'Execute swaps through Safe multi-signature approval',
    icon: '🔐',
    difficulty: 'Advanced',
    condition: {
      type: 'Price Threshold',
      description: 'When AVAX price > $40',
    },
    action: {
      type: 'Safe Execution',
      description: 'Propose swap to Safe (requires 2/3 approvals)',
    },
    useCase: 'Secure automation for teams and DAOs',
    estimatedGas: '~$15-25',
    popularity: 78,
  },
  {
    id: 'stop-loss',
    name: 'Stop Loss Protection',
    category: 'Risk Management',
    description: 'Automatically exit positions to limit losses',
    icon: '🛡️',
    difficulty: 'Beginner',
    condition: {
      type: 'Price Threshold',
      description: 'When ETH price drops below $2,500',
    },
    action: {
      type: 'Multi-Step',
      description: 'Swap ETH → USDC, send Discord alert',
    },
    useCase: 'Protect your portfolio from major drawdowns',
    estimatedGas: '~$6-12',
    popularity: 87,
  },
  {
    id: 'yield-harvester',
    name: 'Yield Harvester',
    category: 'DeFi',
    description: 'Automatically compound yields across chains',
    icon: '🌾',
    difficulty: 'Advanced',
    condition: {
      type: 'Balance Threshold',
      description: 'When rewards balance > 0.1 ETH',
    },
    action: {
      type: 'Multi-Step',
      description: 'Claim → Swap → Reinvest → Notify',
    },
    useCase: 'Maximize DeFi yields with automated compounding',
    estimatedGas: '~$20-35',
    popularity: 82,
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template: Template) => {
    // Store template in localStorage for the builder to pick up
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    // Navigate to builder
    router.push('/builder');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </a>
          <h1 className="text-4xl font-bold mb-2">Workflow Templates</h1>
          <p className="text-slate-400 text-lg">
            Pre-built workflows you can use immediately. Click any template to customize and deploy.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-3xl font-bold text-blue-400">{templates.length}</div>
            <div className="text-slate-400 text-sm">Templates</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-3xl font-bold text-green-400">{categories.length - 1}</div>
            <div className="text-slate-400 text-sm">Categories</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-3xl font-bold text-purple-400">24/7</div>
            <div className="text-slate-400 text-sm">Monitoring</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-3xl font-bold text-yellow-400">$5-35</div>
            <div className="text-slate-400 text-sm">Gas Range</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{template.icon}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    template.difficulty === 'Beginner' ? 'bg-green-900/50 text-green-300' :
                    template.difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-red-900/50 text-red-300'
                  }`}>
                    {template.difficulty}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold mb-2">{template.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{template.description}</p>

              {/* Category */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                  {template.category}
                </span>
              </div>

              {/* Condition & Action */}
              <div className="space-y-3 mb-4">
                <div className="bg-purple-900/20 border border-purple-700/50 rounded p-3">
                  <div className="text-xs text-purple-300 font-medium mb-1">WHEN</div>
                  <div className="text-sm text-slate-300">{template.condition.description}</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
                  <div className="text-xs text-blue-300 font-medium mb-1">THEN</div>
                  <div className="text-sm text-slate-300">{template.action.description}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>Gas: {template.estimatedGas}</span>
                <span>⭐ {template.popularity}% popular</span>
              </div>

              {/* Use Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseTemplate(template);
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTemplate(null)}
          >
            <div
              className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedTemplate.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                    <p className="text-slate-400">{selectedTemplate.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-bold mb-2">Description</h3>
                  <p className="text-slate-300">{selectedTemplate.description}</p>
                </div>

                {/* Use Case */}
                <div>
                  <h3 className="text-lg font-bold mb-2">Use Case</h3>
                  <p className="text-slate-300">{selectedTemplate.useCase}</p>
                </div>

                {/* Workflow Details */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Workflow Details</h3>
                  <div className="space-y-3">
                    <div className="bg-purple-900/20 border border-purple-700/50 rounded p-4">
                      <div className="text-sm text-purple-300 font-medium mb-2">
                        CONDITION: {selectedTemplate.condition.type}
                      </div>
                      <div className="text-slate-300">{selectedTemplate.condition.description}</div>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded p-4">
                      <div className="text-sm text-blue-300 font-medium mb-2">
                        ACTION: {selectedTemplate.action.type}
                      </div>
                      <div className="text-slate-300">{selectedTemplate.action.description}</div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900 rounded p-3">
                    <div className="text-xs text-slate-400 mb-1">Difficulty</div>
                    <div className="font-medium">{selectedTemplate.difficulty}</div>
                  </div>
                  <div className="bg-slate-900 rounded p-3">
                    <div className="text-xs text-slate-400 mb-1">Est. Gas</div>
                    <div className="font-medium">{selectedTemplate.estimatedGas}</div>
                  </div>
                  <div className="bg-slate-900 rounded p-3">
                    <div className="text-xs text-slate-400 mb-1">Popularity</div>
                    <div className="font-medium">{selectedTemplate.popularity}%</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Use This Template
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
