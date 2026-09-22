import React, { useState } from "react";
import { ClientData } from "../types";
import { Copy, Check, Bot, Sparkles, Code2, Layers, Key, Globe, Phone, Shield, TestTube2, Terminal, Bug, FileCode } from "lucide-react";

interface AiPromptKitViewProps {
  clients: ClientData[];
  onOpenOnboardModal: () => void;
}

export const AiPromptKitView: React.FC<AiPromptKitViewProps> = ({ clients, onOpenOnboardModal }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || "");
  const [mode, setMode] = useState<"master" | "steps">("steps");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [format, setFormat] = useState<"react" | "html" | "testing" | "task_spec" | "bug_fix">("react");
  const [copied, setCopied] = useState(false);
  const [copiedPill, setCopiedPill] = useState<string | null>(null);
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const planName = selectedClient?.subscription?.planName || "Starter Plan";
  const maxImages = selectedClient?.subscription?.maxImages || 30;
  const maxStorageMb = selectedClient?.subscription?.maxStorageBytes
    ? Math.round(selectedClient.subscription.maxStorageBytes / (1024 * 1024))
    : 1200;

  const clientId = selectedClient?.id || "cl_hyd_ananya_01";
  const publicKey = selectedClient?.publicApiKey || "pk_live_sample_key_123";
  const secretKey = selectedClient?.secretApiKey || "sk_live_sample_secret_456";
  const businessName = selectedClient?.businessName || "Ananya Designer Boutique";
  const ownerName = selectedClient?.ownerName || "Ananya Reddy";
  const ownerPhone = selectedClient?.ownerPhone || "919876543210";
  const primaryDomain = selectedClient?.primaryDomain || "ananyaboutique.com";
  const city = selectedClient?.city || "Hyderabad";
  const storeAddress = selectedClient?.storeAddress || "Road No. 36, Jubilee Hills, Hyderabad";
  const instagramHandle = selectedClient?.instagramHandle || "@ananyadesigners";
  const adminUsername = selectedClient?.adminUsername || "admin";
  const adminPassword = selectedClient?.adminPassword || "StorePassword@123";
  const copyPill = (text: string, pillId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPill(pillId);
    setTimeout(() => setCopiedPill(null), 1500);
  };

  // STEP 1 PROMPT: Root SDK Setup
  const step1Prompt = `# ==============================================================================
# STEP 1 OF 5: ROOT SDK INITIALIZATION & HEAD CONFIGURATION
# ==============================================================================

You are starting Step 1 of building the boutique website for **"${businessName}"** (${ownerName}) in ${city}.
Your only task in this step is to attach and initialize the BoutiqueCore SDK in root \`index.html\`.

### 📋 TARGET CLIENT CONFIGURATION
- CLIENT ID: "${clientId}"
- PUBLIC KEY: "${publicKey}"
- PRIMARY DOMAIN: "${primaryDomain}"
- OWNER WHATSAPP: "${ownerPhone}"
- SDK SCRIPT CDN: "http://localhost:4000/sdk/v1/boutique-sdk.min.js"
- CENTRAL API: "http://localhost:4000"

### 🛠️ IMPLEMENTATION INSTRUCTIONS
In your root \`index.html\` inside the \`<head>\` tag, include and initialize the SDK:
\`\`\`html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${businessName} - Boutique Fashion & Bridal Studio</title>

  <!-- 1. Central Boutique Platform SDK Script -->
  <script src="http://localhost:4000/sdk/v1/boutique-sdk.min.js"></script>
  <script>
    // 2. Initialize Master SDK on window.boutique
    window.boutique = new BoutiqueSDK({
      clientId: "${clientId}",
      publicKey: "${publicKey}",
      apiUrl: "http://localhost:4000",
      whatsappNumber: "${ownerPhone}",
      debug: true
    });
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
\`\`\`

### ✅ STEP 1 VERIFICATION
Open the browser console (F12) on \`http://localhost:5173\`:
\`window.boutique\` must be defined and \`await window.boutique.gatekeeper.checkStatus()\` should return \`{ status: "TESTING" }\` or \`{ status: "ACTIVE" }\`.
`;

  // STEP 2 PROMPT: Public Storefront & WhatsApp Orders
  const step2Prompt = `# ==============================================================================
# STEP 2 OF 5: PUBLIC STOREFRONT, DYNAMIC S3 GALLERY & WHATSAPP ORDERS
# ==============================================================================

You are building Step 2 for **"${businessName}"**: The public collection gallery and WhatsApp 1-click checkout.

### 📋 STORE CONTEXT
- Store Name: "${businessName}"
- Owner WhatsApp: "${ownerPhone}"
- Location: "${storeAddress}"
- Instagram: "${instagramHandle}"

### 🛠️ IMPLEMENTATION INSTRUCTIONS
1. **TypeScript Definitions (\`src/types/boutique.d.ts\`):**
\`\`\`ts
export interface BoutiqueProduct {
  id: string;
  title?: string;
  price?: number;
  fileUrl: string;
  category: string;
}

declare global {
  interface Window {
    boutique?: {
      storage: { fetchMedia: () => Promise<BoutiqueProduct[]> };
      whatsapp: { openChat: (product: BoutiqueProduct, customPhone?: string) => void };
    };
    BoutiqueSDK?: any;
  }
}
\`\`\`

2. **Collection Component (\`src/components/Collection.tsx\`):**
- Fetch dynamic S3 cloud dresses on mount: \`const dresses = await window.boutique.storage.fetchMedia();\`
- Render luxury dress cards with high-res photos, title, and price in ₹.
- Bind *"Order on WhatsApp / Custom Blouse Stitching"* button:
  \`window.boutique.whatsapp.openChat(product);\`
  *Automatically sends pre-filled dress details targeting +${ownerPhone}.*

### ✅ STEP 2 VERIFICATION
1. The storefront displays dresses loaded live from AWS S3 without hardcoded local files.
2. Clicking *"Order on WhatsApp"* opens WhatsApp chat to +${ownerPhone} with the selected dress details.
`;

  // STEP 3 PROMPT: Store Owner /admin Panel & WebP S3 Uploader
  const step3Prompt = `# ==============================================================================
# STEP 3 OF 5: STORE OWNER /admin PANEL & AWS S3 UPLOADER
# ==============================================================================

You are building Step 3 for **"${businessName}"**: The drop-in Store Owner Admin Panel at route \`/admin\`.

### 📋 ADMIN CREDENTIALS & S3 LIMITS
- CLIENT ID: "${clientId}"
- PUBLIC KEY: "${publicKey}"
- SECRET KEY: "${secretKey}" (Used for photo uploads, deletions & password changes)
- DEFAULT STORE OWNER LOGIN: Username: \`${adminUsername}\` | Password: \`${adminPassword}\`
- PLAN QUOTA: ${planName} — Max ${maxImages} Photos | ${maxStorageMb} MB Cloud Storage

### 🛠️ IMPLEMENTATION INSTRUCTIONS
Mount the Drop-in Admin UI controller at route \`/admin\` (or \`/admin/index.html\`):

\`\`\`tsx
import React, { useEffect, useRef } from "react";

export function AdminPage() {
  const adminMountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adminMountRef.current && window.BoutiqueSDK) {
      const adminSDK = new window.BoutiqueSDK({
        clientId: "${clientId}",
        publicKey: "${publicKey}",
        secretKey: "${secretKey}",
        apiUrl: "http://localhost:4000",
        whatsappNumber: "${ownerPhone}"
      });
      // Mounts login gate (admin / ${adminPassword}), WebP uploader, live quota meter & catalog manager
      adminSDK.admin.mount(adminMountRef.current);
    }
  }, []);

  return <div ref={adminMountRef} className="min-h-screen bg-slate-50 py-8" />;
}
\`\`\`

### ✅ STEP 3 VERIFICATION
1. Navigate to \`http://localhost:5173/admin\` -> Protected Login Screen appears.
2. Log in with \`${adminUsername}\` and \`${adminPassword}\`.
3. Upload a dress -> Image automatically compresses to WebP (<400KB), uploads to AWS S3, and updates the quota bar.
`;

  // STEP 4 PROMPT: Gatekeeper & Billing
  const step4Prompt = `# ==============================================================================
# STEP 4 OF 5: GATEKEEPER BANNER & RAZORPAY RENEWAL MODAL
# ==============================================================================

You are wiring Step 4 for **"${businessName}"**: Gatekeeper subscription verification and self-serve Razorpay renewals.

### 📋 SUBSCRIPTION SPECIFICATIONS
- Plan Tier: ${planName}
- Central API: "http://localhost:4000"

### 🛠️ IMPLEMENTATION INSTRUCTIONS
1. **Self-Serve Subscription Renewal Button:**
   In your Admin Subscription Tab:
   \`\`\`tsx
   // 1. Pay/Renew active monthly subscription (UPI / Card)
   const handleRenew = () => {
     window.boutique?.billing.openRenewalModal();
   };

   // 2. Upgrade to higher tier plan
   const handleUpgrade = (targetPlanId: string) => {
     window.boutique?.billing.openRenewalModal({ planId: targetPlanId });
   };
   \`\`\`

2. **Gatekeeper Behavior Contract:**
   - Fast \`<20ms\` verification on public page load.
   - If \`GRACE_PERIOD\` (3-day grace): Floating renewal banner.
   - If \`SUSPENDED\`: Background blurs with full-screen Lock Screen overlay and UPI payment button.
   - When paid via Razorpay webhook: Automatically unlocks site in 3 seconds without page reload!

### ✅ STEP 4 VERIFICATION
Clicking "Renew Subscription" opens the embedded Razorpay checkout modal with amount in ₹.
`;

  // 1. REACT PROMPT
  const reactPrompt = `# ==============================================================================
# AI AGENT BUILDER SPECIFICATION: BOUTIQUE STORE & CUSTOM REACT /ADMIN WIRING
# ==============================================================================

You are building a high-converting, luxury React (Vite + Tailwind CSS) boutique website and Custom Store Owner Admin for **"${businessName}"** (${ownerName}) located in ${city}.
You MUST strictly follow these 6 Architecture & SDK Attachment Mandates.

---

### 📋 MANDATE 1: CREDENTIALS & SUBSCRIPTION CONTRACT
- **CLIENT ID:** "${clientId}"
- **PUBLIC KEY:** "${publicKey}"
- **SECRET KEY:** "${secretKey}" (Used for /admin photo uploads, deletions & password changes)
- **STORE OWNER /ADMIN LOGIN:** Username: \`${adminUsername}\` | Password: \`${adminPassword}\`
- **DOMAIN:** "${primaryDomain}" (Must match allowed domains whitelist)
- **OWNER WHATSAPP:** "${ownerPhone}"
- **STORE LOCATION:** "${storeAddress}"
- **INSTAGRAM:** "${instagramHandle}"
- **CURRENT PLAN:** ${planName} (Max ${maxImages} Photos | ${maxStorageMb} MB S3 Cloud Storage)
- **CENTRAL API:** "http://localhost:4000"
- **SDK CDN SCRIPT:** "http://localhost:4000/sdk/v1/boutique-sdk.min.js"
- **LIVE SERVER HEALTH ENDPOINT:** "http://localhost:4000/api/v1/admin/ping-domain?domain=${primaryDomain}"

### 🛡️ MANDATE 2: ROOT SDK ATTACHMENT IN index.html
Include the Master SDK in \`index.html\` \`<head>\` tag:
\`\`\`html
<script src="http://localhost:4000/sdk/v1/boutique-sdk.min.js"></script>
<script>
  window.boutique = new BoutiqueSDK({
    clientId: "${clientId}",
    publicKey: "${publicKey}",
    secretKey: "${secretKey}",
    apiUrl: "http://localhost:4000",
    whatsappNumber: "${ownerPhone}",
    debug: true
  });
</script>
\`\`\`

---

### 👗 MANDATE 3: PUBLIC DYNAMIC COLLECTION & WHATSAPP ORDERS (React)
Create \`src/types/boutique.d.ts\`:
\`\`\`ts
export interface BoutiqueProduct {
  id: string;
  title?: string;
  price?: number;
  fileUrl: string;
  category: string;
}

declare global {
  interface Window {
    boutique?: {
      storage: {
        fetchMedia: () => Promise<BoutiqueProduct[]>;
        upload: (file: File, options?: any) => Promise<BoutiqueProduct>;
        delete: (id: string) => Promise<boolean>;
      };
      whatsapp: { openChat: (product: BoutiqueProduct, customPhone?: string) => void };
      gatekeeper: { checkStatus: (forceRefresh?: boolean) => Promise<any> };
      billing: { openRenewalModal: (options?: { planId?: string; billingCycle?: string }) => void };
    };
    BoutiqueSDK?: any;
  }
}
\`\`\`

In \`src/components/Collection.tsx\`:
- Fetch dresses on mount: \`window.boutique.storage.fetchMedia()\`.
- Attach click trigger to *"Order on WhatsApp"*: \`window.boutique.whatsapp.openChat(product)\`.

---

### 💳 MANDATE 4: CUSTOM REACT /ADMIN — "Subscription Plans" TAB WIRING
In your \`Subscription Plans\` view/tab:
1. **Fetch Active Subscription Status on Mount:**
   \`\`\`tsx
   useEffect(() => {
     if (window.boutique) {
       window.boutique.gatekeeper.checkStatus(true).then((status: any) => {
         setSubscriptionDetails(status);
       });
     }
   }, []);
   \`\`\`
2. **Wire "Renew Active Plan (UPI/Razorpay)" Button:**
   \`\`\`tsx
   const handleRenewCurrentPlan = () => {
     window.boutique?.billing.openRenewalModal();
   };
   \`\`\`
3. **Wire "Upgrade to Growth / Studio Pro / Empire Plan" Button:**
   \`\`\`tsx
   const handleUpgradePlan = (targetPlanId: string) => {
     window.boutique?.billing.openRenewalModal({ planId: targetPlanId });
   };
   \`\`\`

---

### 📸 MANDATE 5: CUSTOM REACT /ADMIN — PHOTO UPLOAD, CATALOG & QUOTAS WIRING
1. **Photo Uploader (In-Browser WebP & AWS S3 Direct Upload):**
   \`\`\`tsx
   const handleUploadDress = async (file: File, title: string, price: number) => {
     try {
       await window.boutique.storage.upload(file, {
         title,
         price,
         category: "bridal_sarees"
       });
       alert("✓ Dress uploaded successfully to AWS S3!");
     } catch (err: any) {
       alert(err.message || "Upload failed");
     }
   };
   \`\`\`
2. **Catalog Grid & Delete:**
   \`\`\`tsx
   const loadCatalog = () => {
     window.boutique?.storage.fetchMedia().then(setDresses);
   };
   const handleDelete = async (photoId: string) => {
     if (confirm("Delete dress and restore plan quota?")) {
       await window.boutique.storage.delete(photoId);
       loadCatalog();
     }
   };
   \`\`\`
`;

  // 2. HTML PROMPT
  const htmlPrompt = `# ==============================================================================
# AI AGENT BUILDER SPECIFICATION: STATIC HTML BOUTIQUE WEBSITE & SDK WIRING
# ==============================================================================

Build a static website for "${businessName}" in ${city} attached to the Central Boutique SaaS SDK.

### 📋 BOUTIQUE CREDENTIALS & ENDPOINTS
- **CLIENT ID:** "${clientId}"
- **PUBLIC KEY:** "${publicKey}"
- **SECRET KEY:** "${secretKey}"
- **STORE OWNER /ADMIN LOGIN:** Username: \`${adminUsername}\` | Password: \`${adminPassword}\`
- **OWNER WHATSAPP:** "${ownerPhone}"
- **LOCATION:** "${storeAddress}"
- **PLAN QUOTA:** ${planName} (Max ${maxImages} Photos | ${maxStorageMb} MB S3 Cloud Storage)
- **SDK SCRIPT:** "http://localhost:4000/sdk/v1/boutique-sdk.min.js"
- **API ENDPOINT:** "http://localhost:4000"
---

### 🛡️ ROOT SDK ATTACHMENT IN index.html
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${businessName} - Boutique Collection</title>
  <script src="http://localhost:4000/sdk/v1/boutique-sdk.min.js"></script>
  <script>
    window.boutique = new BoutiqueSDK({
      clientId: "${clientId}",
      publicKey: "${publicKey}",
      secretKey: "${secretKey}",
      apiUrl: "http://localhost:4000",
      whatsappNumber: "${ownerPhone}"
    });
  </script>
</head>
<body>
  <!-- Dynamic Catalog Mount Point -->
  <div id="boutique-collection-grid"></div>

  <script>
    window.addEventListener("DOMContentLoaded", () => {
      window.boutique.gallery.mountGallery("#boutique-collection-grid", {
        columns: 3,
        enableWhatsAppOrder: true
      });
    });
  </script>
</body>
</html>
\`\`\`
`;

  // 3. 🧪 AUTOMATED SDK VERIFICATION & E2E TESTING PROMPT ⭐
  const testingPrompt = `# ==============================================================================
# AI TASK & DEVELOPER CHECKLIST: END-TO-END SDK VERIFICATION TEST SUITE
# ==============================================================================

You are verifying that the newly built static/React boutique website for **"${businessName}"** is 100% attached to the Central Boutique SaaS SDK and backend API with zero errors.

---

### 📋 TARGET CLIENT CONFIGURATION
- **CLIENT ID:** "${clientId}"
- **PUBLIC KEY:** "${publicKey}"
- **SECRET KEY:** "${secretKey}"
- **STORE OWNER CREDENTIALS:** \`${adminUsername}\` / \`${adminPassword}\`
- **OWNER WHATSAPP:** "${ownerPhone}"
- **DOMAIN:** "${primaryDomain}"
- **API ENDPOINT:** "http://localhost:4000"
- **PLAN LIMITS:** Max ${maxImages} Photos | ${maxStorageMb} MB S3 Storage
---

### 🧪 1. BROWSER CONSOLE AUTOMATED SMOKE TEST SCRIPT
Open the browser console (F12 -> Console) on \`http://localhost:5173\` (or your website URL) and run:

\`\`\`javascript
async function runBoutiqueFullE2ETest() {
  console.log("%c🚀 STARTING COMPLETE BOUTIQUE SDK CLIENT-SIDE E2E TEST...", "color: #6366f1; font-weight: bold; font-size: 14px;");
  let passedCount = 0;

  // TEST 1: Global SDK Instance Check
  if (window.boutique && window.BoutiqueSDK) {
    console.log("%c✓ TEST 1 PASSED: BoutiqueSDK instance detected on window.boutique", "color: #10b981; font-weight: bold;");
    passedCount++;
  } else {
    console.error("❌ TEST 1 FAILED: window.boutique is not initialized. Check <script> tag in index.html.");
  }

  // TEST 2: Gatekeeper Active Status Check
  try {
    const start = performance.now();
    const status = await window.boutique.gatekeeper.checkStatus(true);
    const duration = Math.round(performance.now() - start);
    console.log(\`%c✓ TEST 2 PASSED: Gatekeeper status verified in \${duration}ms -> Status: '\${status.status}' (Plan: \${status.planName})\`, "color: #10b981; font-weight: bold;");
    passedCount++;
  } catch (err) {
    console.error("❌ TEST 2 FAILED: Gatekeeper status check failed:", err);
  }

  // TEST 3: Dynamic S3 Cloud Collection Fetch
  try {
    const dresses = await window.boutique.storage.fetchMedia();
    console.log(\`%c✓ TEST 3 PASSED: Dynamic AWS S3 collection fetched successfully -> \${dresses.length} active dresses retrieved.\`, "color: #10b981; font-weight: bold;");
    passedCount++;
  } catch (err) {
    console.error("❌ TEST 3 FAILED: S3 media fetch failed:", err);
  }

  // TEST 4: WhatsApp Order Link Generator
  try {
    const sampleProduct = { title: "Bridal Silk Saree", price: 18500, fileUrl: "https://example.com/saree.webp" };
    const waLink = window.boutique.whatsapp.generateOrderLink(sampleProduct);
    if (waLink.includes("${ownerPhone}") && waLink.includes("Bridal%20Silk%20Saree")) {
      console.log("%c✓ TEST 4 PASSED: WhatsApp click-to-chat URL correctly formatted targeting +${ownerPhone}", "color: #10b981; font-weight: bold;");
      passedCount++;
    } else {
      throw new Error("WhatsApp link missing phone or title parameters");
    }
  } catch (err) {
    console.error("❌ TEST 4 FAILED: WhatsApp generator error:", err);
  }

  // TEST 5: Razorpay Checkout Modal Bridge
  try {
    if (typeof window.boutique.billing.openRenewalModal === "function") {
      console.log("%c✓ TEST 5 PASSED: Billing Razorpay modal trigger is available and ready.", "color: #10b981; font-weight: bold;");
      passedCount++;
    } else {
      throw new Error("billing.openRenewalModal is undefined");
    }
  } catch (err) {
    console.error("❌ TEST 5 FAILED: Billing module error:", err);
  }

  console.log(\`%c========================================================\`, "color: #6366f1;");
  console.log(\`%c🎉 TEST COMPLETE: \${passedCount} / 5 CLIENT SDK CHECKS PASSED!\`, "color: #10b981; font-size: 13px; font-weight: bold;");
  console.log(\`%c========================================================\`, "color: #6366f1;");
}

runBoutiqueFullE2ETest();
\`\`\`

---

### 📋 2. MANUAL 4-STEP QUALITY ASSURANCE CHECKLIST
Verify each item manually on the website:
- [ ] **1. Public Catalog Render:** Open public website -> Dresses appear automatically from S3 without hardcoding.
- [ ] **2. WhatsApp Order Trigger:** Click *"Order on WhatsApp"* -> WhatsApp opens targeting **${ownerPhone}**.
- [ ] **3. Store Owner /admin Login:** Go to \`/admin\` -> Log in with username & password.
- [ ] **4. Photo Upload & S3 Quota:** In \`/admin\`, upload a saree -> Image auto-compresses to WebP, uploads to S3, and updates quota counter.
- [ ] **5. Killswitch & Instant Unlock:** In Super Admin, click *"Force Suspend"* -> Website locks with Suspension Screen. Click *"Pay Renewal"* -> Site unlocks in 3 seconds!
`;

  // 4. TASK SPECIFICATION & FRONTEND INTEGRATION PROMPT
  const taskSpecPrompt = `# ==============================================================================
# 🎯 TASK SPECIFICATION: CLIENT BOUTIQUE FRONTEND & SDK WIRING VERIFICATION
# ==============================================================================

You are an expert QA Engineer and Senior Frontend Architect assigned to audit, verify, and wire the boutique website for:
- **Store Name:** "${businessName}" (${ownerName})
- **Primary Domain:** "${primaryDomain}" (Allowed: localhost, ${primaryDomain})
- **ClientID:** "${clientId}"
- **Public Key:** "${publicKey}"
- **Secret Key:** "${secretKey}"
- **Store WhatsApp:** "${ownerPhone}"
- **Store Address:** "${storeAddress}"
- **Platform Central API:** "http://localhost:4000"
- **SDK Script CDN:** "http://localhost:4000/sdk/v1/boutique-sdk.min.js"

---

### 📋 TASK SPECIFICATION OBJECTIVES
Your mission is to inspect the codebase, identify missing SDK bridges, fix broken linkages, and deliver a fully compliant boutique website.

### 🛠️ MANDATORY ARCHITECTURAL CHECKLIST

#### 1. SDK Script Attachment in \`index.html\`:
Confirm \`<script src="http://localhost:4000/sdk/v1/boutique-sdk.min.js"></script>\` is present in \`<head>\` and initialized on \`window.boutique\`:
\`\`\`html
<script src="http://localhost:4000/sdk/v1/boutique-sdk.min.js"></script>
<script>
  window.boutique = new BoutiqueSDK({
    clientId: "${clientId}",
    publicKey: "${publicKey}",
    secretKey: "${secretKey}",
    apiUrl: "http://localhost:4000",
    whatsappNumber: "${ownerPhone}",
    debug: true
  });
</script>
\`\`\`

#### 2. Dynamic AWS S3 Gallery Fetching:
- **Inspection:** In \`src/components/Collection.tsx\` (or catalog section), ensure products are NOT hardcoded.
- **Fix / Wiring:** Products must be dynamically retrieved via \`await window.boutique.storage.fetchMedia()\`.

#### 3. 1-Click WhatsApp Ordering Hook:
- **Inspection:** Verify clicking "Order on WhatsApp" triggers \`window.boutique.whatsapp.openChat(product)\` targeting \`+${ownerPhone}\`.

#### 4. Store Owner /admin Integration:
- **Inspection:** Ensure route \`/admin\` is protected by username (\`${adminUsername}\`) and password (\`${adminPassword}\`).
- **Direct S3 Uploads:** Photo uploader must invoke \`window.boutique.storage.upload(file, { title, price })\` with auto WebP compression and quota guard.

#### 5. Razorpay 1-Click Renewal Modal:
- **Inspection:** Ensure subscription status or renew button triggers \`window.boutique.billing.openRenewalModal()\`.

---

### 🚀 DELIVERABLE ACCEPTANCE CRITERIA
1. No hardcoded mock images in the gallery — all loaded live from S3.
2. All SDK sub-modules (\`storage\`, \`whatsapp\`, \`gatekeeper\`, \`billing\`, \`admin\`) wired with zero runtime console errors.
`;

  // 5. BUG FIXING & ERROR REMEDIATION PROMPT
  const bugFixPrompt = `# ==============================================================================
# 🐞 BUG FIXING & SDK AUDIT SPECIFICATION: BOUTIQUE CLIENT FRONTEND
# ==============================================================================

You are tasked with diagnosing, debugging, and resolving all bugs and misconfigurations in the boutique website for **"${businessName}"**.

### 📋 TARGET CLIENT CONTEXT
- **CLIENT ID:** "${clientId}"
- **PUBLIC KEY:** "${publicKey}"
- **SECRET KEY:** "${secretKey}"
- **DOMAIN:** "${primaryDomain}"
- **API BACKEND:** "http://localhost:4000"
- **SDK CDN URL:** "http://localhost:4000/sdk/v1/boutique-sdk.min.js"

---

### 🔍 COMMON BUGS TO DIAGNOSE & RESOLVE

#### ❌ Bug 1: \`window.boutique is undefined\` or SDK Not Initialized
- **Symptom:** Console error: \`Cannot read properties of undefined (reading 'storage')\`.
- **Fix:** Ensure \`<script src="http://localhost:4000/sdk/v1/boutique-sdk.min.js"></script>\` is loaded synchronously before React bundle in \`index.html\`.

#### ❌ Bug 2: 403 Forbidden / "UNAUTHORIZED_DOMAIN" Error
- **Symptom:** SDK requests fail with HTTP 403.
- **Fix:** Ensure the active browser origin matches whitelist: \`${primaryDomain}\`, \`localhost\`, or \`127.0.0.1\`.

#### ❌ Bug 3: S3 Upload Quota Breached or Missing Secret Key
- **Symptom:** In \`/admin\`, photo uploads fail with 401 Unauthorized or 403 Quota Limit.
- **Fix:** Verify \`secretKey: "${secretKey}"\` is provided to SDK instance in \`/admin\` and check current plan limit (${maxImages} photos max).

#### ❌ Bug 4: WhatsApp Order Button Doesn't Pre-fill Details
- **Symptom:** WhatsApp opens empty or with wrong number.
- **Fix:** Ensure product object contains \`{ title, price, fileUrl }\` and calls \`window.boutique.whatsapp.openChat(product, "${ownerPhone}")\`.

#### ❌ Bug 5: Razorpay Checkout Not Opening
- **Symptom:** Clicking "Pay Renewal" does nothing or throws undefined error.
- **Fix:** Ensure \`window.boutique.billing.openRenewalModal()\` is bound to button \`onClick\` handler.

---

### 🧪 INSTANT VERIFICATION SNIPPET
Paste into Browser Console (F12) to verify full health:
\`\`\`javascript
console.log("Checking SDK:", !!window.boutique);
window.boutique.gatekeeper.checkStatus(true).then(console.log).catch(console.error);
\`\`\`
`;
  // STEP 5 PROMPT: Testing & Smoke Test
  const step5Prompt = testingPrompt;

  const activeStepPrompt =
    currentStep === 1
      ? step1Prompt
      : currentStep === 2
      ? step2Prompt
      : currentStep === 3
      ? step3Prompt
      : currentStep === 4
      ? step4Prompt
      : step5Prompt;

  const activePrompt =
    mode === "steps"
      ? activeStepPrompt
      : format === "react"
      ? reactPrompt
      : format === "html"
      ? htmlPrompt
      : format === "task_spec"
      ? taskSpecPrompt
      : format === "bug_fix"
      ? bugFixPrompt
      : testingPrompt;
  const handleCopy = () => {
    navigator.clipboard.writeText(activePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/60 border border-slate-200/80 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Boutique Website & Subscription SDK Prompt Kit
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Prompt Kit & Subscription SDK Mandates Hub
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Select any onboarded boutique store to generate its complete <strong>React Builder Prompt</strong>, <strong>HTML Prompt</strong>, or <strong>Automated SDK Testing Prompt</strong>.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          {copied
            ? "Prompt Copied to Clipboard!"
            : mode === "steps"
            ? `Copy Step ${currentStep} Prompt`
            : format === "react"
            ? "Copy React Prompt"
            : format === "html"
            ? "Copy HTML Prompt"
            : format === "task_spec"
            ? "Copy Task Spec Prompt"
            : format === "bug_fix"
            ? "Copy Bug Fix Prompt"
            : "Copy SDK Testing Prompt"}
        </button>
      </div>
      {/* Step-by-Step vs All-in-One Mode Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" /> AI Execution Mode
            </h2>
            <p className="text-xs text-slate-500">
              Choose <strong>Step-by-Step Phased Prompts</strong> (Prevents AI builder confusion) or <strong>Master All-in-One Prompt</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => setMode("steps")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === "steps"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🪜 Step-by-Step Phased Prompts</span>
              <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-normal">Recommended</span>
            </button>

            <button
              onClick={() => setMode("master")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "master"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📦 All-in-One Master Prompt
            </button>
          </div>
        </div>

        {/* Step Buttons (If in Steps Mode) */}
        {mode === "steps" && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Select Development Step (Give each prompt to AI agent in order):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <button
                onClick={() => setCurrentStep(1)}
                className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  currentStep === 1
                    ? "bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs"
                    : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-indigo-600 mb-0.5">Step 1</div>
                <div>🛡️ Root SDK Init</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">index.html &lt;head&gt;</div>
              </button>

              <button
                onClick={() => setCurrentStep(2)}
                className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  currentStep === 2
                    ? "bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs"
                    : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-indigo-600 mb-0.5">Step 2</div>
                <div>👗 Storefront &amp; WA</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">S3 Gallery + Orders</div>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  currentStep === 3
                    ? "bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs"
                    : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-indigo-600 mb-0.5">Step 3</div>
                <div>📱 Owner /admin</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">WebP S3 Uploader</div>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  currentStep === 4
                    ? "bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs"
                    : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-indigo-600 mb-0.5">Step 4</div>
                <div>💳 Gatekeeper</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Razorpay Renewals</div>
              </button>

              <button
                onClick={() => setCurrentStep(5)}
                className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  currentStep === 5
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs"
                    : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">Step 5</div>
                <div>🧪 Smoke Test</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">E2E Verification</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Client Selector & 3 Format Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Client Dropdown */}
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Select Boutique Store to Generate Prompt For:
            </label>
            {clients.length === 0 ? (
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>No clients onboarded yet.</span>
                <button
                  onClick={onOpenOnboardModal}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Onboard a boutique client &rarr;
                </button>
              </div>
            ) : (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.primaryDomain}) • {c.subscription?.planName || "Starter"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3 Output Format Tabs ⭐ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              Select Output Specification Format:
            </label>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/60 flex-wrap">
              <button
                onClick={() => setFormat("react")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  format === "react"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚛️ React (Vite + Tailwind)
              </button>
              <button
                onClick={() => setFormat("html")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  format === "html"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📄 Plain Static HTML
              </button>
              {/* Task Specification Prompt */}
              <button
                onClick={() => setFormat("task_spec")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  format === "task_spec"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>🎯 Task Specification</span>
              </button>
              {/* Bug Fixing & Audit Prompt */}
              <button
                onClick={() => setFormat("bug_fix")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  format === "bug_fix"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>🐞 Bug Fixing &amp; Audit</span>
              </button>
              {/* Testing & Verification Prompt */}
              <button
                onClick={() => setFormat("testing")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  format === "testing"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <TestTube2 className="w-3.5 h-3.5" />
                <span>🧪 SDK Testing &amp; E2E</span>
              </button>
            </div>
          </div>
        </div>
        {/* 4 Core Metadata Pills with 1-Click Copy */}
        {selectedClient && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            {/* Pill 1: ClientID */}
            <div
              onClick={() => copyPill(selectedClient.id, "clientid")}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all cursor-pointer group flex items-center justify-between"
              title="Click to copy ClientID"
            >
              <div className="overflow-hidden pr-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Key className="w-3 h-3 text-indigo-500" /> CLIENTID
                </div>
                <div className="font-mono font-bold text-indigo-600 truncate mt-0.5">{selectedClient.id}</div>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 shrink-0 font-medium">
                {copiedPill === "clientid" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </span>
            </div>

            {/* Pill 2: Domain */}
            <div
              onClick={() => copyPill(selectedClient.primaryDomain, "domain")}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all cursor-pointer group flex items-center justify-between"
              title="Click to copy Domain"
            >
              <div className="overflow-hidden pr-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-indigo-500" /> DOMAIN
                </div>
                <div className="font-semibold text-slate-800 truncate mt-0.5">{selectedClient.primaryDomain}</div>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 shrink-0 font-medium">
                {copiedPill === "domain" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </span>
            </div>

            {/* Pill 3: Owner WhatsApp */}
            <div
              onClick={() => copyPill(selectedClient.ownerPhone, "whatsapp")}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all cursor-pointer group flex items-center justify-between"
              title="Click to copy WhatsApp Phone"
            >
              <div className="overflow-hidden pr-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" /> OWNER WHATSAPP
                </div>
                <div className="font-mono font-bold text-slate-800 truncate mt-0.5">{selectedClient.ownerPhone}</div>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 shrink-0 font-medium">
                {copiedPill === "whatsapp" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </span>
            </div>

            {/* Pill 4: Plan Quota */}
            <div
              onClick={() => copyPill(`${maxImages} Photos • ${maxStorageMb} MB`, "quota")}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all cursor-pointer group flex items-center justify-between"
              title="Click to copy Plan Quota"
            >
              <div className="overflow-hidden pr-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-500" /> PLAN QUOTA
                </div>
                <div className="font-semibold text-emerald-700 truncate mt-0.5">{maxImages} Photos • {maxStorageMb} MB</div>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 shrink-0 font-medium">
                {copiedPill === "quota" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* The AI Prompt Code Box */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            {format === "testing" ? <Terminal className="w-4 h-4 text-emerald-600" /> : <Bot className="w-4 h-4 text-indigo-600" />}
            <span>
              {format === "testing" ? "Automated SDK Testing & Verification Prompt for: " : "AI Builder Prompt for: "}
              <strong className="text-slate-900">{businessName}</strong>
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied Prompt!" : "Copy Prompt Text"}
          </button>
        </div>

        {/* Syntax Box */}
        <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950 select-all leading-relaxed max-h-[600px]">
          {activePrompt}
        </pre>
      </div>
    </div>
  );
};
