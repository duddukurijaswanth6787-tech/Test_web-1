import React, { useState, useEffect } from "react";
import { SubscriptionPlan, ClientData } from "../types";
import { api } from "../services/api";
import { X, Building2, User, Phone, Globe, Layers, CheckCircle2, ShieldCheck, MapPin, Camera, ShoppingBag, Mail, Sparkles, Code2, FileText, UploadCloud, Archive, Trash2, Loader2 } from "lucide-react";
interface OnboardClientModalProps {
  onClose: () => void;
  onSuccess: (client: ClientData) => void;
}

export const OnboardClientModal: React.FC<OnboardClientModalProps> = ({ onClose, onSuccess }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    city: "Hyderabad",
    storeAddress: "",
    instagramHandle: "",
    websiteType: "WHATSAPP_STORE" as "SHOWCASE" | "WHATSAPP_STORE" | "ECOMMERCE",
    primaryDomain: "",
    allowedDomains: "localhost,127.0.0.1",
    planId: "plan_starter",
    environmentMode: "TESTING" as "TESTING" | "LIVE",
    billingCycle: "MONTHLY" as "MONTHLY" | "YEARLY",
    githubRepo: "",
    developerNotes: "",
    projectZipUrl: "",
    projectZipName: "",
  });
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  useEffect(() => {
    api.getPlans().then(setPlans).catch(console.error);
  }, []);

  const sanitizeDomain = (input: string): string => {
    let clean = input.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//, "");
    clean = clean.replace(/\/.*$/, "");
    return clean;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanDomain = sanitizeDomain(formData.primaryDomain);
    const cleanPhone = formData.ownerPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    try {
      let uploadedZipUrl = formData.projectZipUrl || null;
      let uploadedZipName = formData.projectZipName || null;

      if (zipFile) {
        setUploadProgress("Uploading project .zip to AWS S3...");
        const { uploadUrl, publicUrl } = await api.getProjectZipPresignedUrl(zipFile.name);
        await api.uploadFileToS3(uploadUrl, zipFile);
        uploadedZipUrl = publicUrl;
        uploadedZipName = zipFile.name;
      }

      setUploadProgress("Finalizing client onboarding...");
      const res = await api.createClient({
        ...formData,
        projectZipUrl: uploadedZipUrl,
        projectZipName: uploadedZipName,
        primaryDomain: cleanDomain,
        ownerPhone: formattedPhone,
        allowedDomains: `${formData.allowedDomains},${cleanDomain}`,
      });
      onSuccess(res.client);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to onboard client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Onboard New Boutique Client</h2>
              <p className="text-xs text-slate-500">Generates unique ClientID, API keys & AI Mandate specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* 🌟 ENVIRONMENT MODE SELECTION (TESTING VS LIVE) */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Initial Subscription Environment Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                formData.environmentMode === "TESTING"
                  ? "bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                  : "bg-white/60 border-slate-200 hover:bg-white"
              }`}>
                <input
                  type="radio"
                  name="environmentMode"
                  checked={formData.environmentMode === "TESTING"}
                  onChange={() => setFormData({ ...formData, environmentMode: "TESTING" })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">🟡 Testing Mode (Recommended)</div>
                  <div className="text-[10px] text-slate-500">Free testing with AI builder. Subscription clock frozen.</div>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                formData.environmentMode === "LIVE"
                  ? "bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                  : "bg-white/60 border-slate-200 hover:bg-white"
              }`}>
                <input
                  type="radio"
                  name="environmentMode"
                  checked={formData.environmentMode === "LIVE"}
                  onChange={() => setFormData({ ...formData, environmentMode: "LIVE" })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">🟢 Direct Live Mode</div>
                  <div className="text-[10px] text-slate-500">Requires first month payment to activate store admin.</div>
                </div>
              </label>
            </div>
          </div>

          {/* 1. Store Name & Owner Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Boutique / Store Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Sri Leela Bridal Sarees"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Owner Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Ananya Reddy"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* 2. Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                Owner WhatsApp Number
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 9876543210"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Owner Email (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. ananya@boutique.com"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* 3. Location & Instagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Store Location / Area
              </label>
              <input
                type="text"
                placeholder="e.g. Jubilee Hills, Hyderabad"
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-pink-600" />
                Instagram Handle
              </label>
              <input
                type="text"
                placeholder="e.g. @srileelabridal"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* 4. Website Type & Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                Website Architecture Type
              </label>
              <select
                value={formData.websiteType}
                onChange={(e) => setFormData({ ...formData, websiteType: e.target.value as "SHOWCASE" | "WHATSAPP_STORE" | "ECOMMERCE" })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="WHATSAPP_STORE">WhatsApp Ordering Catalog (Recommended)</option>
                <option value="SHOWCASE">Static Luxury Showcase / Portfolio</option>
                <option value="ECOMMERCE">Full E-commerce (Cart + Gateway)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                Primary Domain
              </label>
              <input
                required
                type="text"
                placeholder="e.g. srileelasarees.com or localhost"
                value={formData.primaryDomain}
                onChange={(e) => setFormData({ ...formData, primaryDomain: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* 5. Subscription Plan & Billing Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Subscription Plan Tier
              </label>
              <select
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.priceInrMonthly}/mo - {p.maxImages} Photos)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Billing Frequency
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as "MONTHLY" | "YEARLY" })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="MONTHLY">Monthly Billing Cycle (30 Days)</option>
                <option value="YEARLY">Annual Billing Cycle (365 Days)</option>
              </select>
            </div>
          </div>

          {/* 6. Whitelisted Origins */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Whitelisted Origins & Subdomains (Anti-Theft)
            </label>
            <input
              type="text"
              value={formData.allowedDomains}
              onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
            />
          </div>

          {/* 7. 🐙 Optional GitHub Repo & Developer Vault Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                GitHub Repository URL (Optional)
              </label>
              <input
                type="url"
                placeholder="e.g. https://github.com/agency/boutique-site"
                value={formData.githubRepo}
                onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Developer Vault / Private Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Vercel deployment, branch main, custom CSS notes"
                value={formData.developerNotes}
                onChange={(e) => setFormData({ ...formData, developerNotes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* 8. 📦 Optional Project Source Code (.zip) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-indigo-600" />
                Project Source Code Archive (.zip) (Optional)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Stored in AWS S3 Bucket</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Upload your website code bundle, static assets, or template zip file. It will be backed up directly to AWS S3.
            </p>

            {zipFile ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100 shadow-sm text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Archive className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-mono text-slate-800 font-medium truncate">{zipFile.name}</span>
                  <span className="text-[10px] text-slate-400">({(zipFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setZipFile(null)}
                  className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 cursor-pointer bg-white transition-all group">
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors mb-1" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                  Click to select .zip project archive
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Accepts .zip files up to 100MB</span>
                <input
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setZipFile(file);
                  }}
                />
              </label>
            )}
          </div>

          {uploadProgress && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-medium flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{uploadProgress}</span>
            </div>
          )}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              {loading ? "Creating..." : <><CheckCircle2 className="w-4 h-4" /> Onboard & Generate Keys</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
