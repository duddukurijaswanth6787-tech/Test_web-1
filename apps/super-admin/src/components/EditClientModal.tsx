import React, { useState, useEffect } from "react";
import { SubscriptionPlan, ClientData } from "../types";
import { api } from "../services/api";
import { X, Building2, User, Phone, Globe, Layers, CheckCircle2, ShieldCheck, MapPin, Camera, ShoppingBag, Mail, Lock, Eye, EyeOff, Code2, FileText, UploadCloud, Archive, Trash2, Loader2, Download } from "lucide-react";
interface EditClientModalProps {
  client: ClientData;
  onClose: () => void;
  onSuccess: (updatedClient: ClientData) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ client, onClose, onSuccess }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    businessName: client.businessName,
    ownerName: client.ownerName,
    ownerPhone: client.ownerPhone,
    ownerEmail: client.ownerEmail || "",
    city: client.city || "Hyderabad",
    storeAddress: client.storeAddress || "",
    instagramHandle: client.instagramHandle || "",
    websiteType: client.websiteType || ("WHATSAPP_STORE" as "SHOWCASE" | "WHATSAPP_STORE" | "ECOMMERCE"),
    primaryDomain: client.primaryDomain,
    allowedDomains: client.allowedDomains,
    adminUsername: client.adminUsername || "admin",
    adminPassword: client.adminPassword || "StorePassword@123",
    githubRepo: client.githubRepo || "",
    developerNotes: client.developerNotes || "",
    projectZipUrl: client.projectZipUrl || "",
    projectZipName: client.projectZipName || "",
    planId: client.subscription?.planId || "plan_starter",
  });
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [removeExistingZip, setRemoveExistingZip] = useState(false);
  useEffect(() => {
    api.getPlans().then(setPlans).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalZipUrl = removeExistingZip ? null : formData.projectZipUrl || null;
      let finalZipName = removeExistingZip ? null : formData.projectZipName || null;

      if (zipFile) {
        setUploadProgress("Uploading updated project .zip to AWS S3...");
        const { uploadUrl, publicUrl } = await api.getProjectZipPresignedUrl(zipFile.name, client.id);
        await api.uploadFileToS3(uploadUrl, zipFile);
        finalZipUrl = publicUrl;
        finalZipName = zipFile.name;
      }

      setUploadProgress("Saving store profile...");
      const res = await api.updateClientProfile(client.id, {
        ...formData,
        projectZipUrl: finalZipUrl,
        projectZipName: finalZipName,
      });
      onSuccess(res.client);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update client profile");
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
              <h2 className="text-lg font-bold text-slate-900">Edit Boutique Store Profile</h2>
              <p className="text-xs text-slate-500 font-mono">ClientID: {client.id}</p>
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
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Owner Email
              </label>
              <input
                type="email"
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
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* 4. Domain & Website Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                Primary Domain
              </label>
              <input
                required
                type="text"
                value={formData.primaryDomain}
                onChange={(e) => setFormData({ ...formData, primaryDomain: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

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
                <option value="WHATSAPP_STORE">WhatsApp Ordering Catalog</option>
                <option value="SHOWCASE">Static Luxury Showcase / Portfolio</option>
                <option value="ECOMMERCE">Full E-commerce (Cart + Gateway)</option>
              </select>
            </div>
          </div>

          {/* 5. 🔒 STORE OWNER LOGIN CREDENTIALS SECTION */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Store Owner /admin Login Credentials
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPassword ? "Hide Password" : "View Password"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Admin Username</label>
                <input
                  type="text"
                  required
                  value={formData.adminUsername}
                  onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Store Admin Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 6. Subscription Plan (Upgrade / Downgrade) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Change Subscription Plan Tier
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

          {/* 7. Whitelisted Origins */}
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

          {/* 8. 🐙 Optional GitHub Repo & Developer Vault Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                GitHub Repository URL
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
                Developer Vault / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. branch main, Vercel URL, custom CSS tags"
                value={formData.developerNotes}
                onChange={(e) => setFormData({ ...formData, developerNotes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* 9. 📦 Optional Project Source Code (.zip) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-indigo-600" />
                Project Source Code Archive (.zip) (Optional)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Stored in AWS S3</span>
            </label>

            {/* Existing File Display */}
            {!removeExistingZip && formData.projectZipUrl && !zipFile && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100 shadow-sm text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Archive className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-mono text-slate-800 font-medium truncate">
                    {formData.projectZipName || "project-source.zip"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={formData.projectZipUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                    title="Download current archive"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setRemoveExistingZip(true)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove archive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* New File Selection */}
            {zipFile ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100 shadow-sm text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Archive className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-mono text-slate-800 font-medium truncate">{zipFile.name}</span>
                  <span className="text-[10px] text-slate-400">({(zipFile.size / (1024 * 1024)).toFixed(2)} MB - New)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setZipFile(null)}
                  className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove replacement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (!formData.projectZipUrl || removeExistingZip) ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 cursor-pointer bg-white transition-all group">
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors mb-1" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                  Click to upload new .zip archive
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Stored directly in AWS S3 Bucket</span>
                <input
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setZipFile(file);
                      setRemoveExistingZip(false);
                    }
                  }}
                />
              </label>
            ) : null}
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
              {loading ? "Saving..." : <><CheckCircle2 className="w-4 h-4" /> Save Profile & Credentials</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
