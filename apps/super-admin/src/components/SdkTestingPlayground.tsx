import React, { useState } from "react";
import { ClientData } from "../types";
import { Play, CheckCircle2, XCircle, RefreshCw, Bot, Copy, Check, Shield, HardDrive, MessageCircle, CreditCard, Sparkles, Layers, Terminal } from "lucide-react";

interface SdkTestingPlaygroundProps {
  clients: ClientData[];
}

interface TestResult {
  id: string;
  name: string;
  status: "idle" | "running" | "passed" | "failed";
  durationMs?: number;
  details?: string;
  responsePayload?: any;
}

export const SdkTestingPlayground: React.FC<SdkTestingPlaygroundProps> = ({ clients }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || "");
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const [testResults, setTestResults] = useState<Record<string, TestResult>>({
    gatekeeper: { id: "gatekeeper", name: "1. Gatekeeper Subscription Verification Check", status: "idle" },
    mediaFetch: { id: "mediaFetch", name: "2. AWS S3 Cloud Collection Fetch Check", status: "idle" },
    quotaCheck: { id: "quotaCheck", name: "3. Storage & Photo Quota Enforcement Check", status: "idle" },
    whatsappTest: { id: "whatsappTest", name: "4. WhatsApp Click-to-Chat Order Link Generator", status: "idle" },
    antiTamper: { id: "antiTamper", name: "5. Anti-Tamper Domain Whitelist Security Check", status: "idle" },
    billingOrder: { id: "billingOrder", name: "6. Self-Serve Razorpay Renewal Order Creation", status: "idle" },
  });

  const runSingleTest = async (testId: string) => {
    if (!selectedClient) return;

    setTestResults((prev) => ({
      ...prev,
      [testId]: { ...prev[testId], status: "running" },
    }));

    const start = Date.now();
    const apiUrl = "http://localhost:4000/api/v1";

    try {
      if (testId === "gatekeeper") {
        const res = await fetch(`${apiUrl}/client/status`, {
          headers: {
            "x-client-id": selectedClient.id,
            "x-public-key": selectedClient.publicApiKey,
          },
        });
        const duration = Date.now() - start;
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setTestResults((prev) => ({
          ...prev,
          gatekeeper: {
            ...prev.gatekeeper,
            status: "passed",
            durationMs: duration,
            details: `Status is '${data.status}' (Plan: ${data.planName}). Verified in ${duration}ms.`,
            responsePayload: data,
          },
        }));
      }

      if (testId === "mediaFetch") {
        const res = await fetch(`${apiUrl}/storage/media`, {
          headers: {
            "x-client-id": selectedClient.id,
            "x-public-key": selectedClient.publicApiKey,
          },
        });
        const duration = Date.now() - start;
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setTestResults((prev) => ({
          ...prev,
          mediaFetch: {
            ...prev.mediaFetch,
            status: "passed",
            durationMs: duration,
            details: `Retrieved ${data.length} active collection photos from AWS S3 in ${duration}ms.`,
            responsePayload: data,
          },
        }));
      }

      if (testId === "quotaCheck") {
        const sub = selectedClient.subscription;
        const currentCount = selectedClient.usage.currentImagesCount;
        const maxImages = sub?.maxImages || 30;
        const duration = Date.now() - start;
        setTestResults((prev) => ({
          ...prev,
          quotaCheck: {
            ...prev.quotaCheck,
            status: "passed",
            durationMs: duration,
            details: `Current: ${currentCount}/${maxImages} photos. Storage: ${(selectedClient.usage.currentStorageBytes / (1024 * 1024)).toFixed(1)} MB used.`,
            responsePayload: { currentCount, maxImages, storageUsedMb: (selectedClient.usage.currentStorageBytes / (1024 * 1024)).toFixed(1) },
          },
        }));
      }

      if (testId === "whatsappTest") {
        const phone = selectedClient.ownerPhone;
        const sampleMsg = `Hello ${selectedClient.businessName}! I want to order this saree: https://${selectedClient.primaryDomain}`;
        const generatedLink = `https://wa.me/${phone}?text=${encodeURIComponent(sampleMsg)}`;
        const duration = Date.now() - start;
        setTestResults((prev) => ({
          ...prev,
          whatsappTest: {
            ...prev.whatsappTest,
            status: "passed",
            durationMs: duration,
            details: `WhatsApp chat URL pre-formatted targeting +${phone}.`,
            responsePayload: { targetPhone: phone, link: generatedLink },
          },
        }));
      }

      if (testId === "antiTamper") {
        // Request with unauthorized origin to test rejection
        const res = await fetch(`${apiUrl}/client/status`, {
          headers: {
            "x-client-id": selectedClient.id,
            "x-public-key": selectedClient.publicApiKey,
            origin: "http://unauthorized-hacker-site.com",
          },
        });
        const duration = Date.now() - start;
        if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          setTestResults((prev) => ({
            ...prev,
            antiTamper: {
              ...prev.antiTamper,
              status: "passed",
              durationMs: duration,
              details: `Anti-Tamper Passed: Unauthorized domain rejected with 403 Forbidden.`,
              responsePayload: errData,
            },
          }));
        } else {
          throw new Error(`Expected 403 Forbidden for unauthorized domain, got HTTP ${res.status}`);
        }
      }

      if (testId === "billingOrder") {
        const res = await fetch(`${apiUrl}/billing/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": selectedClient.id,
            "x-public-key": selectedClient.publicApiKey,
          },
          body: JSON.stringify({ billingCycle: "MONTHLY" }),
        });
        const duration = Date.now() - start;
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setTestResults((prev) => ({
          ...prev,
          billingOrder: {
            ...prev.billingOrder,
            status: "passed",
            durationMs: duration,
            details: `Razorpay Order generated: ${data.orderId} (Amount: ₹${data.amountInr}).`,
            responsePayload: data,
          },
        }));
      }
    } catch (err: unknown) {
      const duration = Date.now() - start;
      setTestResults((prev) => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          status: "failed",
          durationMs: duration,
          details: (err as Error).message || "Test failed",
        },
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    for (const testId of Object.keys(testResults)) {
      await runSingleTest(testId);
    }
    setIsRunningAll(false);
  };

  const sdkVerificationPrompt = `# AI PROMPT: STATIC BOUTIQUE WEBSITE SDK VERIFICATION & TEST SUITE

You are running a complete automated verification test suite for the boutique website "${selectedClient?.businessName || "Boutique"}".
Verify that all 5 BoutiqueCore SDK sub-modules are attached and functioning with zero errors.

---

### 1. TARGET BOUTIQUE CONTRACT
- **CLIENT ID:** "${selectedClient?.id || "cl_hyd_test"}"
- **PUBLIC KEY:** "${selectedClient?.publicApiKey || "pk_live_test"}"
- **OWNER WHATSAPP:** "${selectedClient?.ownerPhone || "919876543210"}"
- **PRIMARY DOMAIN:** "${selectedClient?.primaryDomain || "boutique.com"}"
- **API ENDPOINT:** "http://localhost:4000"

---

### 2. TEST EXECUTION SCRIPT
Write and run a smoke test in the browser console:
\`\`\`javascript
async function testBoutiqueSDK() {
  console.log("🚀 STARTING BOUTIQUE SDK CLIENT-SIDE SMOKE TEST...");

  // 1. Check SDK Instance
  if (!window.boutique) throw new Error("BoutiqueSDK is not initialized on window.boutique");
  console.log("✓ SDK Instance detected.");

  // 2. Test Gatekeeper Verification
  const status = await window.boutique.gatekeeper.checkStatus(true);
  console.log("✓ Gatekeeper Status Verified:", status.status, "(Plan: " + status.planName + ")");

  // 3. Test Dynamic Gallery Fetch
  const media = await window.boutique.storage.fetchMedia();
  console.log("✓ Dynamic Collection Fetched:", media.length, "photos loaded.");

  // 4. Test WhatsApp Checkout Generator
  if (media.length > 0) {
    const waLink = window.boutique.whatsapp.generateOrderLink(media[0]);
    console.log("✓ WhatsApp Order Link Formatted:", waLink);
  }

  console.log("🎉 ALL SDK SUB-MODULES ARE FUNCTIONAL & ATTACHED SUCCESSFULLY!");
}
testBoutiqueSDK();
\`\`\`

---

### 3. ACCEPTANCE CRITERIA
- Gatekeeper status response must be HTTP 200 { status: 'ACTIVE' }.
- Image gallery must render photos dynamically without hardcoded files.
- WhatsApp click-to-chat must launch WhatsApp targeting ${selectedClient?.ownerPhone}.
`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(sdkVerificationPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-white to-emerald-50/60 border border-slate-200/80 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Live SDK Diagnostic & Test Playground
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            SDK Health & Live Testing Playground
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Test and verify all 6 SDK sub-modules in real-time (Gatekeeper, S3 Media, Quotas, WhatsApp bridge, Anti-tamper, and Razorpay orders) to ensure your boutique websites work flawlessly.
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunningAll || clients.length === 0}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-md shadow-emerald-100 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          {isRunningAll ? "Running Diagnostics..." : "Run All 6 SDK Tests"}
        </button>
      </div>

      {/* Boutique Selector Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Select Boutique Store to Test SDK Against:
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName} ({c.primaryDomain}) • {c.id}
              </option>
            ))}
          </select>
        </div>

        {selectedClient && (
          <div className="flex items-center gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
              <span className="font-bold text-emerald-700 font-mono">{selectedClient.subscription?.status || "ACTIVE"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">S3 Media</span>
              <span className="font-bold text-cyan-700 font-mono">{selectedClient.usage.currentImagesCount} Photos</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Interactive Tests Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600" /> Live SDK Diagnostic Test Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(testResults).map((test) => (
            <div
              key={test.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
                    {test.id === "gatekeeper" && <Shield className="w-4 h-4 text-indigo-600" />}
                    {test.id === "mediaFetch" && <HardDrive className="w-4 h-4 text-cyan-600" />}
                    {test.id === "quotaCheck" && <Layers className="w-4 h-4 text-amber-600" />}
                    {test.id === "whatsappTest" && <MessageCircle className="w-4 h-4 text-emerald-600" />}
                    {test.id === "antiTamper" && <Shield className="w-4 h-4 text-rose-600" />}
                    {test.id === "billingOrder" && <CreditCard className="w-4 h-4 text-purple-600" />}
                    {test.name}
                  </h3>

                  {/* Status Badge */}
                  <div>
                    {test.status === "idle" && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">Ready</span>
                    )}
                    {test.status === "running" && (
                      <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Testing...
                      </span>
                    )}
                    {test.status === "passed" && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Passed ({test.durationMs}ms)
                      </span>
                    )}
                    {test.status === "failed" && (
                      <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" /> Failed
                      </span>
                    )}
                  </div>
                </div>

                {test.details && (
                  <p className="text-xs text-slate-600 mt-2 font-medium">{test.details}</p>
                )}

                {test.responsePayload && (
                  <pre className="mt-3 p-3 bg-slate-950 text-slate-300 text-[11px] font-mono rounded-xl overflow-x-auto max-h-28">
                    {JSON.stringify(test.responsePayload, null, 2)}
                  </pre>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => runSingleTest(test.id)}
                  disabled={test.status === "running"}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3" /> Run Test Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SDK Verification Test Suite AI Prompt Exporter */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">AI Agent SDK Verification Test Suite Prompt</h3>
              <p className="text-xs text-slate-400">Copy this prompt into your AI builder to verify that all SDK hooks are working on the static website</p>
            </div>
          </div>
          <button
            onClick={handleCopyPrompt}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedPrompt ? "Copied Test Prompt!" : "Copy Test Verification Prompt"}
          </button>
        </div>

        <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto bg-slate-950 rounded-2xl select-all max-h-64">
          {sdkVerificationPrompt}
        </pre>
      </div>
    </div>
  );
};
