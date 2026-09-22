import { prisma } from "./prisma.js";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export async function seedDatabase() {
  console.log("[Seed] Seeding default subscription plans...");

  // 1. Seed Subscription Plans
  const plans = [
    {
      id: "plan_starter",
      name: "Starter Showcase Plan",
      priceInrMonthly: 799,
      priceInrYearly: 7999,
      maxImages: 30,
      maxStorageBytes: BigInt(1288490188), // ~1.2 GB
      allowCustomDomain: true,
      allowWhatsappOrdering: true,
      allowEcommerce: false,
    },
    {
      id: "plan_growth",
      name: "Growth Catalog Plan",
      priceInrMonthly: 1499,
      priceInrYearly: 14999,
      maxImages: 100,
      maxStorageBytes: BigInt(5368709120), // ~5.0 GB
      allowCustomDomain: true,
      allowWhatsappOrdering: true,
      allowEcommerce: false,
    },
    {
      id: "plan_pro",
      name: "Pro Boutique E-commerce Plan",
      priceInrMonthly: 2999,
      priceInrYearly: 29999,
      maxImages: 500,
      maxStorageBytes: BigInt(21474836480), // ~20.0 GB
      allowCustomDomain: true,
      allowWhatsappOrdering: true,
      allowEcommerce: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  // 2. Seed Default Super Admin Account
  const defaultAdminPassword = "AdminPassword@123";
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);

  await prisma.superAdmin.upsert({
    where: { email: env.SUPER_ADMIN_EMAIL },
    update: {},
    create: {
      email: env.SUPER_ADMIN_EMAIL,
      name: "Master Agency Owner",
      passwordHash: passwordHash,
    },
  });

  // 3. Seed Default Client test_web
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const graceEnd = new Date(nextMonth.getTime() + 3 * 24 * 60 * 60 * 1000);

  const testWebClient = {
    id: "cl_hyd_testweb_ac36e7",
    businessName: "test_web",
    ownerName: "Test Owner",
    ownerPhone: "917660922413",
    ownerEmail: "test@gmail.com",
    city: "Hyderabad",
    storeAddress: "mad,hyd",
    instagramHandle: "@test",
    websiteType: "WHATSAPP_STORE",
    primaryDomain: "web-122.vercel.app",
    allowedDomains: "*,localhost,127.0.0.1,localhost:5173,web-122.vercel.app,*.vercel.app,web-122-87h266p8z-vsss.vercel.app,web-122-ech9ot1e1-vsss.vercel.app",
    adminUsername: "admin",
    publicApiKey: "pk_live_" + "5c3ac9ca816bea0b15000da1b6f4a84b",
    secretApiKey: "sk_live_" + "8877a142eb412312e434fa41b747f7342218cbd3f016b201",
    githubRepo: "https://github.com/duddukurijaswanth6787-tech/test_web",
  };

  await prisma.client.upsert({
    where: { id: testWebClient.id },
    update: testWebClient,
    create: testWebClient,
  });

  await prisma.clientSubscription.upsert({
    where: { clientId: testWebClient.id },
    update: {
      planId: "plan_starter",
      environmentMode: "LIVE",
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      activatedAt: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      gracePeriodEnd: graceEnd,
      isManualOverride: false,
    },
    create: {
      clientId: testWebClient.id,
      planId: "plan_starter",
      environmentMode: "LIVE",
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      activatedAt: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      gracePeriodEnd: graceEnd,
      isManualOverride: false,
    },
  });

  console.log("[Seed] Database seed completed successfully.");
}

// Allow direct execution
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
