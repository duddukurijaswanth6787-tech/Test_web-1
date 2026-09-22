import { BoutiqueConfig, MediaItem } from "../types.js";

export class WhatsAppModule {
  private config: BoutiqueConfig;

  constructor(config: BoutiqueConfig) {
    this.config = config;
  }

  /**
   * Generates a pre-filled WhatsApp click-to-chat order URL
   */
  public generateOrderLink(product: MediaItem, customPhone?: string): string {
    const rawPhone = customPhone || this.config.whatsappNumber || "919999999999";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");

    const priceText = product.price ? `\n- Price: Rs. ${product.price.toLocaleString("en-IN")}` : "";
    const message = `Hello! I would like to order this item from your collection:
- Product: ${product.title || product.fileName}${priceText}
- Image: ${product.fileUrl}

Please share available sizes and payment details. Thank you!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Opens WhatsApp chat directly
   */
  public openChat(product: MediaItem, customPhone?: string): void {
    if (typeof window === "undefined") return;
    const link = this.generateOrderLink(product, customPhone);
    window.open(link, "_blank", "noopener,noreferrer");
  }
}
