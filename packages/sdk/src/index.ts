/**
 * BoutiqueCore Unified Client SDK
 * Single script bundle containing Gatekeeper, Storage/Quota Enforcer, Dynamic CMS & Self-Serve Billing
 */

import { BoutiqueConfig, ClientStatus } from "./types.js";
import { GatekeeperModule } from "./modules/gatekeeper.js";
import { StorageModule } from "./modules/storage.js";
import { WhatsAppModule } from "./modules/whatsapp.js";
import { CmsModule } from "./modules/cms.js";
import { BillingModule } from "./modules/billing.js";
import { AdminModule } from "./modules/admin.js";

declare global {
  interface Window {
    BoutiqueSDK?: typeof BoutiqueSDK;
    BoutiqueSDKInstance?: BoutiqueSDK;
  }
}

export class BoutiqueSDK {
  public readonly config: BoutiqueConfig;
  public readonly apiUrl: string;
  public readonly gatekeeper: GatekeeperModule;
  public readonly storage: StorageModule;
  public readonly whatsapp: WhatsAppModule;
  public readonly gallery: CmsModule;
  public readonly billing: BillingModule;
  public readonly admin: AdminModule;

  constructor(config: BoutiqueConfig) {
    if (!config.clientId) {
      throw new Error("[BoutiqueSDK] clientId is required.");
    }
    if (!config.publicKey) {
      throw new Error("[BoutiqueSDK] publicKey is required.");
    }

    this.config = config;
    this.apiUrl = config.apiUrl || "http://localhost:4000";

    // Initialize Submodules
    this.gatekeeper = new GatekeeperModule(config);
    this.storage = new StorageModule(config);
    this.whatsapp = new WhatsAppModule(config);
    this.gallery = new CmsModule(config, this.storage, this.whatsapp);
    this.billing = new BillingModule(config, this.gatekeeper);
    this.admin = new AdminModule(config, this.storage, this.gatekeeper, this.billing);

    // Auto-gatekeep on initialization unless explicitly disabled
    if (config.autoGatekeep !== false && typeof window !== "undefined") {
      this.gatekeeper.checkStatus().catch((err) => {
        console.warn("[BoutiqueSDK] Gatekeeper check notice:", err);
      });
    }

    if (typeof window !== "undefined") {
      window.BoutiqueSDKInstance = this;
    }
  }

  public async getStatus(forceRefresh = false): Promise<ClientStatus> {
    return this.gatekeeper.checkStatus(forceRefresh);
  }
}

// Auto-bind to window in browser environments
if (typeof window !== "undefined") {
  window.BoutiqueSDK = BoutiqueSDK;
}

export * from "./types.js";
export default BoutiqueSDK;
