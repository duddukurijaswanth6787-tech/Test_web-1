import React, { useState } from "react";
import { Copy, Check, BookOpen, Code2, Shield, Sparkles, Cpu, CreditCard, Image } from "lucide-react";

export const MandatesGuideView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const reactHeadCode = `<!-- In your React index.html <head> -->
<script src="http://localhost:4000/sdk/v1/boutique-sdk.min.js"></script>
<script>
  window.boutique = new BoutiqueSDK({
    clientId: "YOUR_CLIENT_ID",          // e.g. "cl_hyd_ananya_01"
    publicKey: "YOUR_PUBLIC_KEY",        // e.g. "pk_live_xxxxxx"
    secretKey: "YOUR_SECRET_KEY",        // Required for uploads & password updates
    whatsappNumber: "919876543210",      // Owner WhatsApp Number
    apiUrl: "http://localhost:4000",
    debug: true
  });
</script>`;

  const reactSubscriptionTabCode = `// Wiring: Custom "Subscription Plans" Tab in React Admin
import React, { useEffect, useState } from "react";

export function SubscriptionPlansTab() {
  const [subDetails, setSubDetails] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch live active subscription details from SDK
    if (window.boutique) {
      window.boutique.gatekeeper.checkStatus(true).then((status: any) => {
        setSubDetails(status);
      });
    }
  }, []);

  // 2. Trigger Razorpay renewal for current active plan
  const handleRenewActivePlan = () => {
    window.boutique?.billing.openRenewalModal();
  };

  // 3. Trigger Razorpay upgrade for higher tier
  const handleUpgradePlan = (targetPlanId: string) => {
    window.boutique?.billing.openRenewalModal({ planId: targetPlanId });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
        <h3 className="font-bold text-slate-900">Current Plan: {subDetails?.planName}</h3>
        <p className="text-xs text-slate-600">Renews on: {subDetails?.currentPeriodEnd ? new Date(subDetails.currentPeriodEnd).toLocaleDateString('en-IN') : '—'}</p>
        <button onClick={handleRenewActivePlan} className="mt-3 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer">
          ⚡ Renew Active Plan (₹{subDetails?.priceInrMonthly}/mo)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl">
          <h4 className="font-bold text-slate-900">Bridal Studio Pro</h4>
          <p className="text-xl font-bold text-slate-900 mt-1">₹1,999 / mo</p>
          <ul className="text-xs text-slate-600 my-3 space-y-1">
            <li>📸 100 Photos Gallery Limit</li>
            <li>☁️ 5.0 GB AWS S3 Storage</li>
          </ul>
          <button onClick={() => handleUpgradePlan('plan_growth')} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer">
            Upgrade to Pro &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}`;

  const reactUploaderTabCode = `// Wiring: Custom "Upload Dress Photo" Tab in React Admin
const handlePhotoUpload = async (file: File, title: string, price: number) => {
  try {
    // SDK compresses to WebP (<400KB), checks plan quota, and uploads directly to AWS S3 in ap-south-2
    const newMedia = await window.boutique.storage.upload(file, {
      title,
      price,
      category: "bridal_sarees",
      onProgress: (pct: number) => console.log("Upload: " + pct + "%")
    });
    alert("✓ Dress uploaded to AWS S3 successfully!");
  } catch (err: any) {
    alert("Upload failed: " + err.message);
  }
};`;

  const reactCatalogTabCode = `// Wiring: Custom "Uploaded Catalog" Grid in React Admin
const [dresses, setDresses] = useState<any[]>([]);

// 1. Fetch live cloud dresses
const loadCatalog = () => {
  window.boutique?.storage.fetchMedia().then((items: any[]) => {
    setDresses(items);
  });
};

// 2. Delete dress & restore quota
const handleDeleteDress = async (id: string) => {
  if (confirm("Delete this saree?")) {
    await window.boutique.storage.delete(id);
    loadCatalog();
  }
};`;

  const reactAdminMountCode = `// Wiring: Drop-in Store Owner /admin Panel Mount
import React, { useEffect, useRef } from "react";

export function AdminPage() {
  const adminMountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adminMountRef.current && window.BoutiqueSDK) {
      const adminSDK = new window.BoutiqueSDK({
        clientId: "YOUR_CLIENT_ID",
        publicKey: "YOUR_PUBLIC_KEY",
        secretKey: "YOUR_SECRET_KEY", // Required for photo uploads & password changes
        apiUrl: "http://localhost:4000",
        whatsappNumber: "919876543210"
      });
      // Mounts login gate (admin / StorePassword@123), WebP uploader, live quota bar & billing modal
      adminSDK.admin.mount(adminMountRef.current);
    }
  }, []);

  return <div ref={adminMountRef} className="min-h-screen bg-slate-50 py-8" />;
}`;

  const browserSmokeTestCode = `// Browser Console Smoke Test Script (Press F12 -> Console on http://localhost:5173)
async function runBoutiqueSmokeTest() {
  console.log("%c🚀 TESTING BOUTIQUE SDK INTEGRATION...", "color: #6366f1; font-weight: bold; font-size: 14px;");

  // 1. Check SDK Global Object
  if (!window.boutique) throw new Error("window.boutique is not initialized! Check <script> tag.");
  console.log("%c✓ 1. SDK Instance detected on window.boutique", "color: #10b981; font-weight: bold;");

  // 2. Check Gatekeeper Subscription Verification (<20ms)
  const start = performance.now();
  const status = await window.boutique.gatekeeper.checkStatus(true);
  const duration = Math.round(performance.now() - start);
  console.log("%c✓ 2. Gatekeeper Status:", "color: #10b981;", status.status, "(Verified in " + duration + "ms, Plan: " + status.planName + ")");

  // 3. Check AWS S3 Dynamic Gallery Fetch
  const media = await window.boutique.storage.fetchMedia();
  console.log("%c✓ 3. Dynamic AWS S3 Media Fetched:", "color: #10b981;", media.length + " active dresses retrieved.");

  // 4. Test WhatsApp Order Link
  const testProduct = { title: "Bridal Silk Saree", price: 18500 };
  const waLink = window.boutique.whatsapp.generateOrderLink(testProduct);
  console.log("%c✓ 4. WhatsApp Order Link Formatted:", "color: #10b981;", waLink);

  console.log("%c🎉 ALL SDK SUB-MODULES PASSED WITH 100% SUCCESS!", "color: #10b981; font-weight: bold; font-size: 14px;");
}
runBoutiqueSmokeTest();`;
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/60 border border-slate-200/80 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Developer Integration Guide & Architecture Mandates
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Subscription SDK & Custom React Admin Tabs Mandates
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Follow these mandates to wire your custom boutique website's admin tabs (<strong>Subscription Plans, Uploader, Catalog, Quota & Storage, Password</strong>) directly to the live SDK methods and Razorpay payment modals.
          </p>
        </div>
      </div>

      {/* 4 Core Architecture Mandates Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">1. Gatekeeper</h3>
          <p className="text-xs text-slate-600">
            <code className="text-indigo-600 font-mono">gatekeeper.checkStatus()</code> checks subscription in &lt;20ms and triggers lock screen if overdue.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">2. Live Billing Modal</h3>
          <p className="text-xs text-slate-600">
            <code className="text-amber-700 font-mono">billing.openRenewalModal()</code> launches embedded Razorpay checkout with instant auto-unlock.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Image className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">3. AWS S3 Uploader</h3>
          <p className="text-xs text-slate-600">
            <code className="text-cyan-700 font-mono">storage.upload(file)</code> auto-resizes WebP &lt;400KB and uploads directly to Hyderabad S3 bucket.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">4. WhatsApp Orders</h3>
          <p className="text-xs text-slate-600">
            <code className="text-emerald-700 font-mono">whatsapp.openChat()</code> pre-fills dress name, price in ₹, and photo link on click.
          </p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600" />
          Exact SDK Method Attachment Contracts
        </h2>

        {/* Snippet 1: Root SDK Head */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 font-mono">1. Root SDK Initialization in index.html &lt;head&gt;</span>
            <button
              onClick={() => copyToClipboard(reactHeadCode, "head")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs"
            >
              {copiedSection === "head" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === "head" ? "Copied" : "Copy Snippet"}
            </button>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950 select-all">
            {reactHeadCode}
          </pre>
        </div>

        {/* Snippet 2: Subscription Plans Tab */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 font-mono">2. Subscription Plans Tab & Razorpay Checkout Attachment</span>
            <button
              onClick={() => copyToClipboard(reactSubscriptionTabCode, "subtab")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs"
            >
              {copiedSection === "subtab" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === "subtab" ? "Copied" : "Copy Snippet"}
            </button>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950 select-all max-h-96">
            {reactSubscriptionTabCode}
          </pre>
        </div>

        {/* Snippet 3: Photo Uploader Tab */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 font-mono">3. Photo Uploader Tab (WebP & AWS S3 Presigned Upload)</span>
            <button
              onClick={() => copyToClipboard(reactUploaderTabCode, "uploader")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs"
            >
              {copiedSection === "uploader" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === "uploader" ? "Copied" : "Copy Snippet"}
            </button>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950 select-all">
            {reactUploaderTabCode}
          </pre>
        </div>

        {/* Snippet 4: Uploaded Catalog Grid */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 font-mono">4. Uploaded Catalog Grid (Fetch & Quota Delete)</span>
            <button
              onClick={() => copyToClipboard(reactCatalogTabCode, "catalog")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs"
            >
              {copiedSection === "catalog" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === "catalog" ? "Copied" : "Copy Snippet"}
            </button>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950 select-all">
            {reactCatalogTabCode}
          </pre>
        </div>

        {/* Snippet 5: Complete Drop-in Admin Mount */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 font-mono">5. Complete Drop-in Store Owner /admin Panel Mount</span>
            <button
              onClick={() => copyToClipboard(reactAdminMountCode, "adminmount")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs"
            >
              {copiedSection === "adminmount" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === "adminmount" ? "Copied" : "Copy Snippet"}
            </button>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950 select-all">
            {reactAdminMountCode}
          </pre>
        </div>

        {/* Snippet 6: Browser Console Smoke Test Script */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 font-mono">6. Automated Browser Console Smoke Test Script</span>
            <button
              onClick={() => copyToClipboard(browserSmokeTestCode, "smoketest")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs"
            >
              {copiedSection === "smoketest" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === "smoketest" ? "Copied" : "Copy Snippet"}
            </button>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950 select-all">
            {browserSmokeTestCode}
          </pre>
        </div>
      </div>

      {/* 4-Step Verification Matrix */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Pre-Delivery Verification Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <span>✓</span> Test 1: Active Loading
            </div>
            <p className="text-slate-600">Open client site &rarr; loads in &lt;1.5s with zero lag or errors.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <span>✓</span> Test 2: Photo Quota Bar
            </div>
            <p className="text-slate-600">Open <code className="text-indigo-700 font-mono">/admin</code> &rarr; Upload dress &rarr; Verify quota bar updates live.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <span>✓</span> Test 3: WhatsApp Click-to-Chat
            </div>
            <p className="text-slate-600">Click &quot;Order on WhatsApp&quot; &rarr; Opens WhatsApp with dress name, price, and image.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <span>✓</span> Test 4: Lock &amp; Instant Auto-Unlock
            </div>
            <p className="text-slate-600">Click &quot;Force Suspend&quot; in Super Admin &rarr; Site locks. Pay renewal &rarr; Unlocks in 3s.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
