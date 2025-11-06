import 'dotenv/config';
import { WorkflowEngine } from './services/workflow-engine';
import { Workflow, ConditionType, ActionType } from './types';

/**
 * Demo: DeFi Sniper Workflow
 * 
 * This demonstrates a price-triggered cross-chain swap:
 * "When ETH drops below $3000, swap 0.01 ETH from Arbitrum to BTC on Bitcoin"
 */
async function runDemo() {
  console.log('='.repeat(60));
  console.log('ShiftFlow Demo: DeFi Sniper Workflow');
  console.log('='.repeat(60));
  console.log();

  // Validate environment variables
  const sideshiftSecret = process.env.SIDESHIFT_SECRET;
  const affiliateId = process.env.AFFILIATE_ID;
  const settleAddress = process.env.DEMO_SETTLE_ADDRESS;

  if (!sideshiftSecret || !affiliateId) {
    console.error('ERROR: Missing required environment variables');
    console.error('Please set SIDESHIFT_SECRET and AFFILIATE_ID in .env file');
    process.exit(1);
  }

  if (!settleAddress) {
    console.warn('WARNING: DEMO_SETTLE_ADDRESS not set, using placeholder');
  }

  // Initialize workflow engine
  const engine = new WorkflowEngine(
    sideshiftSecret,
    affiliateId,
    process.env.COINGECKO_API_KEY
  );

  // Define demo workflow
  const demoWorkflow: Workflow = {
    id: 'workflow_defi_sniper_001',
    name: 'DeFi Sniper: ETH Price Drop',
    description: 'Automatically swap ETH to BTC when price drops below $3000',
    userId: 'demo_user',
    condition: {
      type: ConditionType.PRICE_THRESHOLD,
      token: 'ETH',
      comparison: 'below',
      threshold: 3000,
      currency: 'USD',
    },
    actions: [
      {
        type: ActionType.CROSS_CHAIN_SWAP,
        depositCoin: 'eth',
        depositNetwork: 'arbitrum',
        settleCoin: 'btc',
        settleNetwork: 'bitcoin',
        amount: '0.01',
        settleAddress: settleAddress || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Demo address
      },
    ],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    executionCount: 0,
  };

  // Register workflow
  engine.registerWorkflow(demoWorkflow);

  console.log('Workflow registered:');
  console.log(`  ID: ${demoWorkflow.id}`);
  console.log(`  Name: ${demoWorkflow.name}`);
  console.log(`  Condition: ${demoWorkflow.condition.token} ${demoWorkflow.condition.comparison} $${demoWorkflow.condition.threshold}`);
  console.log(`  Action: Swap ${demoWorkflow.actions[0].amount} ${demoWorkflow.actions[0].depositCoin} → ${demoWorkflow.actions[0].settleCoin}`);
  console.log();

  // Start monitoring
  console.log('Starting workflow monitoring...');
  console.log('Press Ctrl+C to stop');
  console.log();

  engine.startMonitoring(30000); // Check every 30 seconds

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\nStopping workflow engine...');
    engine.stopMonitoring();
    process.exit(0);
  });
}

// Run demo
runDemo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});
