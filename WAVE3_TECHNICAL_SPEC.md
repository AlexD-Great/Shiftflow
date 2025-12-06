# ShiftFlow Wave 3 - Technical Specification

**Project:** ShiftFlow - Smart Automation for Cross-Chain DeFi  
**Hackathon:** SideShift Wave 3  
**Timeline:** 11 Days  
**Status:** In Development

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Judge Feedback Analysis](#judge-feedback-analysis)
3. [Wave 3 Goals](#wave-3-goals)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Non-Custodial Solution](#non-custodial-solution)
9. [Execution Engine](#execution-engine)
10. [Security & Authentication](#security--authentication)
11. [SideShift API Integration](#sideshift-api-integration)
12. [Deployment Strategy](#deployment-strategy)
13. [Testing Strategy](#testing-strategy)
14. [User Acquisition Plan](#user-acquisition-plan)
15. [Implementation Timeline](#implementation-timeline)

---

## 📊 Executive Summary

### Current State (Wave 2)
- ✅ Frontend workflow builder with real API integrations
- ✅ SideShift, CoinGecko, Safe SDK integrations
- ✅ 8 pre-built templates
- ✅ Client-side only (no persistence)
- ❌ No backend infrastructure
- ❌ No user accounts
- ❌ No actual execution
- ❌ Custodial concerns

### Wave 3 Objectives
Transform ShiftFlow from a technical demo into a production-ready platform with:
- **Backend infrastructure** for persistence and security
- **Non-custodial architecture** to address custody concerns
- **Real user testing** with 10-20 beta testers
- **Actual workflow execution** with monitoring
- **Professional deployment** with proper DevOps

---

## 🎯 Judge Feedback Analysis

### George's Requirements
**What he wants:**
1. Team expansion plans and skill gap mitigation strategy
2. Real user traction beyond technical demo

**Implementation:**
- Document team expansion roadmap
- Recruit 10-20 beta testers
- Collect user metrics and testimonials
- Show growth trajectory

### Mike's Requirements (CRITICAL)
**The custody problem:**
> "Users would have to give up custody of their funds when creating workflows"

**Solution Required:**
- Non-custodial architecture where users maintain control
- Users never transfer funds to ShiftFlow
- Execution happens via pre-approved transactions or smart contracts

**Technical requirement:**
- Pass end user's IP address via `x-user-ip` header to SideShift API

### Dino's Requirements
**What's needed:**
1. Backend for persistence
2. Backend proxy for API calls (don't call SideShift from browser)

**Benefits:**
- Better security
- Persistent workflows
- Server-side execution
- API key protection

### Blake's Feedback
- Core concept is solid
- Templates are excellent
- Needs further development

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Builder    │  │  Dashboard   │  │  Templates   │      │
│  │     UI       │  │      UI      │  │      UI      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ HTTPS/WebSocket
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              Backend API (Next.js API Routes)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Workflow   │  │   SideShift  │      │
│  │   Service    │  │   Service    │  │     Proxy    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    Database (PostgreSQL)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │  Workflows   │  │  Executions  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│           Background Job Processor (Vercel Cron)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Condition   │  │   Workflow   │  │ Notification │      │
│  │   Monitor    │  │   Executor   │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              External Services & Blockchain                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   SideShift  │  │  CoinGecko   │  │  Blockchain  │      │
│  │     API      │  │     API      │  │     RPCs     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Wagmi + Viem (Web3)
- TanStack Query
- Zustand (state management)

**Backend:**
- Next.js API Routes
- PostgreSQL (Vercel Postgres)
- Prisma ORM
- NextAuth.js
- Vercel Cron

**Infrastructure:**
- Vercel (hosting)
- Vercel Postgres (database)
- Vercel Blob (file storage)

**External APIs:**
- SideShift API v2
- CoinGecko API
- Safe SDK
- Blockchain RPCs

---

## 🗄️ Database Schema

See `WAVE3_DATABASE_SCHEMA.md` for complete Prisma schema with:
- User management
- Workflow storage
- Execution tracking
- Price caching
- Beta tester management

Key tables:
- `User` - Wallet-based authentication
- `Workflow` - Workflow definitions
- `Execution` - Execution history
- `ExecutionLog` - Detailed logs
- `PriceCache` - Price data cache
- `BetaTester` - User testing metrics

---

## 🔧 Backend Implementation

### Key API Routes

**Authentication:**
- `POST /api/auth/[...nextauth]` - NextAuth.js wallet authentication
- Uses SIWE (Sign-In with Ethereum) for non-custodial auth

**Workflows:**
- `GET /api/workflows` - List user workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow details
- `PATCH /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

**SideShift Proxy (CRITICAL):**
- `POST /api/sideshift/quote` - Request quote (with x-user-ip)
- `POST /api/sideshift/shift/fixed` - Create fixed shift (with x-user-ip)
- `GET /api/sideshift/shift/:id` - Get shift status

**Executions:**
- `GET /api/executions` - List executions
- `GET /api/executions/:id` - Get execution details

**Cron Jobs:**
- `GET /api/cron/monitor` - Workflow monitoring (called by Vercel Cron)

---

## 🎨 Frontend Implementation

### Custom Hooks

**`useWalletAuth`** - Wallet-based authentication
- Sign message with wallet
- Authenticate with NextAuth
- Non-custodial login

**`useWorkflows`** - Workflow management
- CRUD operations
- Real-time updates
- TanStack Query integration

**`useSideShiftProxy`** - SideShift integration
- Request quotes
- Create shifts
- Monitor status
- All via backend proxy

**`useExecutions`** - Execution monitoring
- Real-time status
- Execution history
- Error handling

### Updated Components

**WorkflowBuilderV2** - Enhanced builder with:
- Database persistence
- User authentication
- Real-time validation
- Template integration

**Dashboard** - Real-time monitoring:
- Active workflows
- Execution history
- Performance metrics
- Status updates

---

## 🔐 Non-Custodial Solution

### Approach: Pre-Approved Transactions

**How it works:**
1. User approves ShiftFlow smart contract to spend tokens
2. Funds stay in user's wallet
3. ShiftFlow monitors conditions
4. When conditions met, contract pulls funds and executes
5. User can revoke approval anytime

**Benefits:**
- ✅ User maintains custody
- ✅ No fund transfers to ShiftFlow
- ✅ User has full control
- ✅ Transparent on-chain

### Implementation Options

**Option A: ERC-20 Approvals**
- User approves ShiftFlow contract
- Contract executes when conditions met
- Standard ERC-20 pattern

**Option B: Signed Transactions**
- User pre-signs transaction
- Stored encrypted in database
- Broadcast when conditions met

**Option C: Account Abstraction**
- Use Safe or other smart wallet
- Conditional execution logic
- Most flexible but complex

**Recommended:** Start with Option A (ERC-20 approvals) for simplicity.

---

## ⚙️ Execution Engine

### Workflow Monitor

**File: `lib/jobs/workflow-monitor.ts`**

Runs every 60 seconds via Vercel Cron:
1. Fetch all active workflows
2. Check conditions for each
3. Execute if conditions met
4. Log results
5. Send notifications

### Condition Checking

Supported condition types:
- **Price threshold** - Token price above/below value
- **Gas price** - Gas below threshold
- **Time-based** - Specific time/day
- **Portfolio balance** - Balance above/below
- **Custom conditions** - Extensible

### Action Execution

Supported actions:
- **SideShift swap** - Cross-chain swap
- **Safe transaction** - Multi-sig proposal
- **Webhook** - HTTP notification
- **Email** - Email notification

---

## 🔒 Security & Authentication

### Authentication Flow

1. User connects wallet (MetaMask, WalletConnect)
2. User signs SIWE message
3. Backend verifies signature
4. JWT token issued
5. Token used for API requests

### API Security

- Rate limiting (10 req/min per IP)
- CORS configuration
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS protection
- CSRF tokens

### Environment Variables

Required secrets:
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - NextAuth secret
- `SIDESHIFT_SECRET` - SideShift API key
- `AFFILIATE_ID` - SideShift affiliate ID
- `CRON_SECRET` - Cron job authentication

---

## 🔗 SideShift API Integration

### Critical Requirements

**1. x-user-ip Header (Mike's Requirement)**
```typescript
headers: {
  "x-user-ip": req.headers.get("x-forwarded-for") || "unknown"
}
```

**2. Backend Proxy (Dino's Requirement)**
- All SideShift calls go through backend
- Never expose API keys to frontend
- Better security and control

**3. Affiliate ID**
- Always include in requests
- Earn 0.5% commission
- Track via dashboard

### Integration Pattern

```typescript
// Frontend calls backend
const quote = await fetch("/api/sideshift/quote", {
  method: "POST",
  body: JSON.stringify(quoteRequest)
});

// Backend proxies to SideShift with x-user-ip
const response = await fetch("https://sideshift.ai/api/v2/quotes", {
  headers: {
    "x-sideshift-secret": SIDESHIFT_SECRET,
    "x-user-ip": userIp // CRITICAL
  }
});
```

---

## 🚀 Deployment Strategy

### Vercel Deployment

**Step 1: Database Setup**
```bash
# Create Vercel Postgres database
vercel postgres create

# Run migrations
npx prisma migrate deploy
```

**Step 2: Environment Variables**
```bash
# Set in Vercel dashboard
DATABASE_URL=...
NEXTAUTH_SECRET=...
SIDESHIFT_SECRET=...
AFFILIATE_ID=...
CRON_SECRET=...
```

**Step 3: Deploy**
```bash
# Deploy to production
vercel --prod
```

**Step 4: Verify**
- Test API endpoints
- Verify cron jobs running
- Check database connections
- Test workflow execution

### Monitoring

- Vercel Analytics
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring

---

## 🧪 Testing Strategy

### Unit Tests
- Price oracle service
- Condition checking logic
- Action execution
- Authentication flow

### Integration Tests
- Workflow creation
- Execution engine
- SideShift integration
- Database operations

### E2E Tests
- User authentication
- Workflow lifecycle
- Execution monitoring
- Error handling

### Beta Testing
- 10-20 real users
- Collect feedback
- Track metrics
- Iterate quickly

---

## 👥 User Acquisition Plan

### Beta Tester Recruitment

**Channels:**
- Twitter/X announcements
- Discord communities
- Reddit (r/defi, r/ethereum)
- Telegram groups
- Direct outreach

**Incentives:**
- Early access
- Free premium features
- Commission sharing
- Recognition in docs

**Onboarding:**
1. Sign up form
2. Wallet connection
3. Tutorial walkthrough
4. First workflow creation
5. Feedback survey

### Metrics to Track

**User Engagement:**
- Workflows created
- Executions run
- Active users
- Retention rate

**Technical Metrics:**
- Success rate
- Error rate
- Response time
- Uptime

**Business Metrics:**
- SideShift volume
- Commission earned
- User satisfaction
- Feature requests

---

## 📅 Implementation Timeline

### Days 1-3: Backend Foundation
- ✅ Set up database (Prisma + Postgres)
- ✅ Implement authentication (NextAuth + SIWE)
- ✅ Create workflow API routes
- ✅ Build SideShift proxy with x-user-ip
- ✅ Set up Vercel deployment

### Days 4-6: Non-Custodial Solution
- ✅ Design approval mechanism
- ✅ Implement smart contract OR signed tx approach
- ✅ Integrate with workflow system
- ✅ Test thoroughly
- ✅ Document security model

### Days 7-8: Execution Engine
- ✅ Build workflow monitor
- ✅ Implement condition checking
- ✅ Create action executors
- ✅ Set up Vercel Cron
- ✅ Add notification system

### Days 9-10: User Testing
- ✅ Deploy beta version
- ✅ Recruit 10-20 testers
- ✅ Collect feedback
- ✅ Fix critical bugs
- ✅ Gather testimonials

### Day 11: Polish & Submission
- ✅ Update documentation
- ✅ Record demo video
- ✅ Prepare submission
- ✅ Highlight improvements
- ✅ Show user metrics

---

## 📝 Team Expansion Plan

### Current State
- Solo developer (Alex D)
- Full-stack capabilities
- Strong technical execution

### Identified Skill Gaps

**Backend/DevOps:**
- Database optimization
- Scalability planning
- Infrastructure management

**Smart Contracts:**
- Solidity development
- Security auditing
- Gas optimization

**Marketing/Growth:**
- User acquisition
- Community building
- Content creation

**Design/UX:**
- UI/UX improvements
- User research
- Accessibility

### Mitigation Strategy

**Short-term (Wave 3):**
- Leverage existing tools (Vercel, Prisma)
- Use battle-tested libraries
- Focus on core features
- Seek community feedback

**Long-term (Post-Hackathon):**
- Recruit co-founder (backend/smart contracts)
- Hire part-time designer
- Build community of contributors
- Seek mentorship from SideShift team

---

## 🎯 Success Criteria

### Technical Success
- ✅ Backend infrastructure deployed
- ✅ Non-custodial architecture implemented
- ✅ Workflow execution working
- ✅ 99% uptime during testing
- ✅ <2s API response time

### User Success
- ✅ 10+ beta testers recruited
- ✅ 50+ workflows created
- ✅ 20+ successful executions
- ✅ 4+ star average rating
- ✅ Positive testimonials

### Business Success
- ✅ $1,000+ SideShift volume
- ✅ Commission earned
- ✅ Clear growth trajectory
- ✅ Feature roadmap validated

---

## 📚 Additional Resources

### Reference Documents
- `sideshift-hack.md` - Complete SideShift API documentation
- `ARCHITECTURE.md` - System architecture details
- `README.md` - Project overview
- `WAVE3_DATABASE_SCHEMA.md` - Complete database schema

### External Documentation
- [SideShift API Docs](https://sideshift.ai/api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Safe SDK Documentation](https://docs.safe.global)

---

## 🚦 Next Steps

1. **Review this specification** - Ensure understanding of all components
2. **Set up development environment** - Database, API keys, etc.
3. **Start with backend** - Foundation for everything else
4. **Implement non-custodial solution** - Critical for Mike's feedback
5. **Build execution engine** - Core functionality
6. **Deploy and test** - Real-world validation
7. **Recruit beta testers** - User traction
8. **Iterate based on feedback** - Continuous improvement
9. **Prepare submission** - Documentation and demo
10. **Submit for Wave 3** - Show the judges what you've built!

---

**Ready to build? Let's make Wave 3 a success! 🚀**
