# 🧪 ShiftFlow Testing Checklist

**Production URL:** https://shiftflow-web.vercel.app/  
**Last Updated:** December 9, 2025

---

## 📋 Pre-Testing Setup

### Requirements:
- [ ] Web3 wallet installed (MetaMask, Coinbase Wallet, etc.)
- [ ] Small amount of test funds (optional for full execution testing)
- [ ] Modern browser (Chrome, Firefox, Brave)
- [ ] Stable internet connection

---

## 1️⃣ Homepage & Navigation

### Homepage Tests:
- [ ] **Load homepage** - Verify page loads without errors
- [ ] **Beta banner visible** - Check for beta phase indicator at top
- [ ] **Main hero section** - Verify title, description, and emoji display
- [ ] **CTA buttons work:**
  - [ ] "Build Workflow" → redirects to `/builder`
  - [ ] "Smart Account Demo" → redirects to `/demo/safe`
  - [ ] "Browse Templates" → redirects to `/templates`
- [ ] **Bottom CTA buttons:**
  - [ ] "Documentation" → opens GitHub README in new tab
  - [ ] "Try It Now" → redirects to `/builder`
- [ ] **Example workflows display** - Check code snippets render correctly
- [ ] **Features section** - Verify all feature cards display
- [ ] **Tech stack badges** - Check all technology tags show
- [ ] **Footer** - Verify copyright text displays

**Expected Result:** All links work, no broken images, smooth navigation

---

## 2️⃣ Template Library

### Template Page Tests:
- [ ] **Navigate to templates** - Click "Browse Templates" from homepage
- [ ] **Page loads** - Verify templates page renders
- [ ] **Category filters work:**
  - [ ] "All" shows all templates
  - [ ] "Trading" shows trading templates
  - [ ] "DeFi" shows DeFi templates
  - [ ] "Portfolio" shows portfolio templates
- [ ] **Template cards display:**
  - [ ] Icon, name, description visible
  - [ ] Difficulty badge shows (Beginner/Intermediate/Advanced)
  - [ ] Condition and action types display
  - [ ] Popularity percentage shows
- [ ] **Template click** - Click a template card
- [ ] **Modal opens** - Detailed view appears
- [ ] **Modal content:**
  - [ ] Full description visible
  - [ ] Use case explanation
  - [ ] Estimated gas cost
  - [ ] Condition details
  - [ ] Action details
- [ ] **"Use This Template" button** - Click button
- [ ] **Redirect to builder** - Should navigate to `/builder`
- [ ] **Template data loads** - Workflow name should pre-populate
- [ ] **Success message** - Check for template loaded notification

**Expected Result:** Templates load, filter correctly, and populate builder

---

## 3️⃣ Workflow Builder - Basic UI

### Builder Page Tests:
- [ ] **Navigate to builder** - Go to `/builder` directly or via button
- [ ] **Page loads** - Verify builder interface renders
- [ ] **Three main sections visible:**
  - [ ] Condition (When) section
  - [ ] Action (Then) section
  - [ ] Preview section (right sidebar)

### Workflow Name:
- [ ] **Name input field** - Verify input is visible
- [ ] **Type workflow name** - Enter "Test Workflow"
- [ ] **Name updates** - Check preview updates with name

**Expected Result:** Builder loads with all sections visible

---

## 4️⃣ Workflow Builder - Conditions

### Price Threshold Condition:
- [ ] **Select "Price Threshold"** - Choose from condition dropdown
- [ ] **Token dropdown** - Verify tokens available (ETH, BTC, USDT, USDC, SOL, MATIC)
- [ ] **Select token** - Choose "ETH"
- [ ] **Comparison dropdown** - Verify "Above" and "Below" options
- [ ] **Select comparison** - Choose "Below"
- [ ] **Threshold input** - Enter "3000"
- [ ] **Live price displays** - Check current ETH price shows
- [ ] **Trigger text updates** - Verify "Trigger when below $3000" message
- [ ] **Preview updates** - Check right sidebar shows condition

### Gas Threshold Condition:
- [ ] **Select "Gas Threshold"** - Choose from condition dropdown
- [ ] **Network dropdown** - Verify networks available
- [ ] **Select network** - Choose "ethereum"
- [ ] **Comparison** - Select "Below"
- [ ] **Threshold** - Enter "20"
- [ ] **Preview updates** - Check sidebar shows gas condition

### Time-Based Condition:
- [ ] **Select "Time-Based"** - Choose from condition dropdown
- [ ] **Schedule options** - Verify schedule dropdown appears
- [ ] **Preview updates** - Check sidebar reflects time condition

**Expected Result:** All condition types work and update preview

---

## 5️⃣ Workflow Builder - Actions

### Cross-Chain Swap Action:
- [ ] **Select "Cross-Chain Swap"** - Choose from action dropdown
- [ ] **From Coin input** - Enter "eth"
- [ ] **From Network input** - Enter "arbitrum"
- [ ] **To Coin input** - Enter "btc"
- [ ] **To Network input** - Enter "bitcoin"
- [ ] **Amount input** - Enter "0.01"
- [ ] **Settle Address input** - Enter a valid BTC address (or test address)
- [ ] **Preview updates** - Check sidebar shows swap details

### Send Notification Action:
- [ ] **Select "Send Notification"** - Choose from action dropdown
- [ ] **Form fields appear:**
  - [ ] Notification Title input visible
  - [ ] Message textarea visible
  - [ ] Info message about in-app notifications
- [ ] **Enter title** - Type "Price Alert"
- [ ] **Enter message** - Type "ETH price target reached"
- [ ] **Preview updates** - Check sidebar reflects notification action

### Call Webhook Action:
- [ ] **Select "Call Webhook"** - Choose from action dropdown
- [ ] **Form fields appear:**
  - [ ] Webhook URL input visible
  - [ ] Method dropdown (POST/GET) visible
  - [ ] Request Body textarea visible
  - [ ] Info message about webhook calls
- [ ] **Enter URL** - Type "https://webhook.site/unique-id"
- [ ] **Select method** - Choose "POST"
- [ ] **Enter body** - Type `{"event": "workflow_executed"}`
- [ ] **Preview updates** - Check sidebar shows webhook details

### Multi-Step Action:
- [ ] **Select "Multi-Step"** - Choose from action dropdown
- [ ] **Coming soon message** - Verify yellow info box appears
- [ ] **Message content** - Check explanation about future feature

**Expected Result:** All action types display correct form fields

---

## 6️⃣ Workflow Builder - Safe Integration

### Safe Multi-Sig Tests:
- [ ] **"Use Safe Multi-Sig" checkbox** - Locate checkbox
- [ ] **Check the box** - Enable Safe integration
- [ ] **Safe address input appears** - Verify input field shows
- [ ] **Enter Safe address** - Type a valid Safe address
- [ ] **Preview updates** - Check "(via Safe multi-sig)" appears

**Expected Result:** Safe integration option works

---

## 7️⃣ Workflow Builder - Preview & Deploy

### Preview Section:
- [ ] **Preview always visible** - Check right sidebar shows throughout
- [ ] **Condition preview** - Verify "When:" section accurate
- [ ] **Action preview** - Verify "Then:" section accurate
- [ ] **JSON preview** - Check workflow JSON displays correctly
- [ ] **Syntax highlighting** - Verify JSON is formatted

### Deploy Workflow:
- [ ] **"Deploy Workflow" button** - Locate button at bottom
- [ ] **Button enabled** - Verify button is clickable
- [ ] **Click deploy** - Click the button
- [ ] **Loading state** - Check button shows loading indicator
- [ ] **Success message** - Verify success notification appears
- [ ] **Error handling** - If error, check error message displays

**Expected Result:** Preview updates in real-time, deploy button works

---

## 8️⃣ Dashboard

### Dashboard Tests:
- [ ] **Navigate to dashboard** - Go to `/dashboard`
- [ ] **Page loads** - Verify dashboard renders
- [ ] **Workflow list** - Check if created workflows appear
- [ ] **Workflow cards show:**
  - [ ] Workflow name
  - [ ] Status badge (Active/Draft/Paused)
  - [ ] Execution count
  - [ ] Last executed time
  - [ ] Condition summary
  - [ ] Action summary
- [ ] **Action buttons:**
  - [ ] "View" button visible
  - [ ] "Edit" button visible
  - [ ] "Delete" button visible
- [ ] **Activate/Deactivate toggle** - Test workflow activation
- [ ] **Empty state** - If no workflows, check empty state message

**Expected Result:** Dashboard shows workflows with correct data

---

## 9️⃣ Authentication (If Implemented)

### Wallet Connection:
- [ ] **Connect wallet button** - Locate wallet connect button
- [ ] **Click connect** - Click the button
- [ ] **Wallet popup** - Verify wallet extension opens
- [ ] **Approve connection** - Approve in wallet
- [ ] **Connected state** - Check UI shows connected address
- [ ] **Disconnect** - Test disconnect functionality

**Expected Result:** Wallet connects successfully

---

## 🔟 API Testing

### API Test Page:
- [ ] **Navigate to API test** - Go to `/api-test`
- [ ] **Page loads** - Verify test interface renders
- [ ] **SideShift quote test:**
  - [ ] Enter test parameters
  - [ ] Click "Get Quote"
  - [ ] Verify response displays
  - [ ] Check for valid quote data
- [ ] **Price oracle test:**
  - [ ] Select token
  - [ ] Click "Get Price"
  - [ ] Verify current price displays
- [ ] **Error handling** - Test with invalid inputs

**Expected Result:** API calls work and return valid data

---

## 1️⃣1️⃣ Safe Demo Page

### Safe Integration Demo:
- [ ] **Navigate to Safe demo** - Go to `/demo/safe`
- [ ] **Page loads** - Verify demo page renders
- [ ] **Safe SDK integration** - Check if Safe components load
- [ ] **Demo functionality** - Test any interactive elements
- [ ] **Error messages** - Verify proper error handling

**Expected Result:** Safe demo loads without errors

---

## 1️⃣2️⃣ Mobile Responsiveness

### Mobile Tests:
- [ ] **Resize browser** - Test responsive breakpoints
- [ ] **Mobile menu** - Check navigation on mobile
- [ ] **Homepage mobile** - Verify layout adapts
- [ ] **Builder mobile** - Check builder is usable
- [ ] **Templates mobile** - Verify cards stack properly
- [ ] **Dashboard mobile** - Check workflow cards adapt
- [ ] **Touch interactions** - Test buttons and inputs

**Expected Result:** All pages work on mobile devices

---

## 1️⃣3️⃣ Performance Tests

### Load Times:
- [ ] **Homepage load** - Should load in < 3 seconds
- [ ] **Builder load** - Should load in < 3 seconds
- [ ] **Templates load** - Should load in < 3 seconds
- [ ] **Dashboard load** - Should load in < 3 seconds
- [ ] **API responses** - Should respond in < 2 seconds

### Browser Console:
- [ ] **Open DevTools** - Press F12
- [ ] **Check Console tab** - Look for errors
- [ ] **No critical errors** - Verify no red errors
- [ ] **Network tab** - Check for failed requests
- [ ] **Performance tab** - Check for slow operations

**Expected Result:** Fast load times, no console errors

---

## 1️⃣4️⃣ Edge Cases & Error Handling

### Error Scenarios:
- [ ] **Empty form submission** - Try deploying without filling fields
- [ ] **Invalid addresses** - Enter invalid crypto addresses
- [ ] **Invalid amounts** - Enter negative or zero amounts
- [ ] **Invalid JSON** - Enter malformed JSON in webhook body
- [ ] **Network errors** - Test with slow/no internet
- [ ] **Browser back button** - Test navigation history
- [ ] **Refresh page** - Test state persistence

**Expected Result:** Graceful error messages, no crashes

---

## 1️⃣5️⃣ Cross-Browser Testing

### Browser Compatibility:
- [ ] **Chrome** - Test all features
- [ ] **Firefox** - Test all features
- [ ] **Safari** - Test all features (Mac only)
- [ ] **Edge** - Test all features
- [ ] **Brave** - Test all features

**Expected Result:** Consistent behavior across browsers

---

## 1️⃣6️⃣ End-to-End Workflow Test

### Complete Flow:
1. [ ] **Start on homepage**
2. [ ] **Browse templates**
3. [ ] **Select a template**
4. [ ] **Template loads in builder**
5. [ ] **Modify workflow settings**
6. [ ] **Review preview**
7. [ ] **Deploy workflow**
8. [ ] **Navigate to dashboard**
9. [ ] **Verify workflow appears**
10. [ ] **Activate workflow**
11. [ ] **Check status updates**

**Expected Result:** Complete user journey works smoothly

---

## 🐛 Bug Reporting Template

If you find issues, report them with:

```markdown
**Page:** [URL or page name]
**Issue:** [Brief description]
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Browser:** [Chrome/Firefox/etc.]
**Screenshot:** [If applicable]
```

---

## ✅ Testing Summary

### Test Results:
- **Total Tests:** 150+
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___
- **Not Tested:** ___

### Critical Issues:
- [ ] None found
- [ ] List any critical bugs here

### Minor Issues:
- [ ] None found
- [ ] List any minor bugs here

### Recommendations:
- [ ] List any improvements or suggestions

---

## 📊 Test Coverage

### Features Tested:
- ✅ Homepage & Navigation
- ✅ Template Library
- ✅ Workflow Builder (Conditions)
- ✅ Workflow Builder (Actions)
- ✅ Safe Integration
- ✅ Preview & Deploy
- ✅ Dashboard
- ✅ API Testing
- ✅ Mobile Responsiveness
- ✅ Performance
- ✅ Error Handling
- ✅ Cross-Browser

### Not Yet Tested:
- ⏳ Actual workflow execution (requires waiting for conditions)
- ⏳ Notification delivery
- ⏳ Webhook calls
- ⏳ Email notifications
- ⏳ Long-term monitoring

---

## 🎯 Priority Testing Areas

### High Priority (Must Test):
1. ✅ Workflow creation
2. ✅ Template loading
3. ✅ All action types
4. ✅ Deploy functionality
5. ✅ Dashboard display

### Medium Priority (Should Test):
6. ✅ Mobile responsiveness
7. ✅ Error handling
8. ✅ API endpoints
9. ✅ Safe integration
10. ✅ Cross-browser

### Low Priority (Nice to Test):
11. ✅ Performance metrics
12. ✅ Edge cases
13. ✅ Accessibility
14. ✅ SEO elements

---

## 📝 Notes

### Testing Environment:
- **URL:** https://shiftflow-web.vercel.app/
- **Date:** December 9, 2025
- **Version:** Beta
- **Tester:** [Your Name]

### Additional Comments:
[Add any additional observations or feedback here]

---

**Happy Testing!** 🚀

If you encounter any issues, please report them on GitHub or contact the development team.
