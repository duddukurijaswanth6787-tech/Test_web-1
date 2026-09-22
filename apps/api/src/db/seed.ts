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
