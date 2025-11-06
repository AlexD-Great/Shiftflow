# GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
# Windows: winget install GitHub.cli
# Or download from: https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository
gh repo create shiftflow --public --description "Conditional execution layer for cross-chain DeFi - SideShift Wave Hack submission"

# Push code
git add .
git commit -m "Initial commit: ShiftFlow - Conditional execution layer for cross-chain DeFi"
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Web Interface

1. **Go to GitHub**: https://github.com/new

2. **Repository Details**:
   - **Name**: `shiftflow`
   - **Description**: `Conditional execution layer for cross-chain DeFi - SideShift Wave Hack submission`
   - **Visibility**: Public ✅
   - **Initialize**: Don't initialize with README (we already have one)

3. **Click "Create repository"**

4. **Push existing code**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/shiftflow.git
git branch -M main
git add .
git commit -m "Initial commit: ShiftFlow - Conditional execution layer for cross-chain DeFi"
git push -u origin main
```

## Step 2: Configure Repository Settings

### Repository Settings
1. Go to **Settings** → **General**
2. **Features**: Enable Issues, Discussions
3. **Pull Requests**: Enable "Automatically delete head branches"

### Topics (Tags)
Add these topics to help discovery:
- `defi`
- `cross-chain`
- `automation`
- `sideshift`
- `workflow`
- `typescript`
- `hackathon`
- `web3`

### About Section
- **Description**: Conditional execution layer for cross-chain DeFi
- **Website**: [Your demo URL if deployed]
- **Topics**: Add the tags above

### Branch Protection (Optional)
1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass

## Step 3: Add Repository Secrets (for CI/CD)

Go to **Settings** → **Secrets and variables** → **Actions**

Add these secrets if you want automated testing:
- `SIDESHIFT_SECRET` (for testing)
- `AFFILIATE_ID` (for testing)

⚠️ **Note**: Only add if you want CI to run actual API tests

## Step 4: Create Initial Release

After pushing code:

1. Go to **Releases** → **Create a new release**
2. **Tag**: `v0.1.0`
3. **Title**: `ShiftFlow v0.1.0 - Initial Release`
4. **Description**:
```markdown
# ShiftFlow v0.1.0 - Initial Release

## 🎉 First Release for SideShift Wave Hack

### Features
- ✅ Complete SideShift API integration
- ✅ Workflow engine with condition monitoring
- ✅ Price oracle integration (CoinGecko)
- ✅ TypeScript SDK with fluent API
- ✅ Working demo workflow

### Installation
\`\`\`bash
npm install @shiftflow/sdk
\`\`\`

### Quick Start
See [QUICKSTART.md](./QUICKSTART.md)

### Documentation
- [README](./README.md)
- [Architecture](./ARCHITECTURE.md)
- [Examples](./docs/EXAMPLES.md)

Built for SideShift Wave Hack 🚀
```

## Step 5: Update README with Repository Links

Update these placeholders in documentation:
- `[Repository URL]` → `https://github.com/YOUR_USERNAME/shiftflow`
- `[Demo Video]` → Your YouTube/Loom link
- `[Live Demo]` → Your deployed URL (if any)

## Step 6: Create Project Board (Optional)

1. Go to **Projects** → **New project**
2. Choose **Board** template
3. Add columns:
   - 📋 Backlog
   - 🚧 In Progress
   - ✅ Done
   - 🐛 Bugs

## Step 7: Add Collaborators

If working with a team:
1. Go to **Settings** → **Collaborators**
2. Add team members
3. Set appropriate permissions

## Verification Checklist

- [ ] Repository created and public
- [ ] Code pushed to main branch
- [ ] README displays correctly
- [ ] Topics/tags added
- [ ] License file present
- [ ] .gitignore working (no .env files)
- [ ] CI workflow configured
- [ ] Initial release created
- [ ] Repository description set
- [ ] Links in docs updated

## Common Issues

### Issue: "Permission denied (publickey)"
**Solution**: Set up SSH key or use HTTPS with personal access token
```bash
# Use HTTPS instead
git remote set-url origin https://github.com/YOUR_USERNAME/shiftflow.git
```

### Issue: "Repository not found"
**Solution**: Make sure repository name matches exactly
```bash
git remote -v  # Check current remote
git remote set-url origin https://github.com/YOUR_USERNAME/shiftflow.git
```

### Issue: ".env file pushed to GitHub"
**Solution**: Remove it immediately
```bash
git rm --cached .env
git rm --cached packages/engine/.env
git commit -m "Remove .env files"
git push
```

Then go to GitHub → Settings → Secrets and rotate your keys!

## Next Steps

After repository is set up:

1. **Share the link** in hackathon submission
2. **Record demo video** and add link to README
3. **Deploy** (optional): Vercel for frontend, Railway for backend
4. **Promote**: Share on Twitter with #SideShiftWaveHack

## Repository Template

Use this template for future projects:
```bash
gh repo create NEW_PROJECT --template YOUR_USERNAME/shiftflow --public
```

---

**Ready to push? Let's go! 🚀**
