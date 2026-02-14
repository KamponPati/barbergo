import { PrismaClient, ServiceMode, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Demo identities used by the web shell.
  await prisma.user.upsert({
    where: { id: "admin_1" },
    update: { role: UserRole.admin, status: UserStatus.active },
    create: { id: "admin_1", role: UserRole.admin, status: UserStatus.active }
  });
  await prisma.user.upsert({
    where: { id: "partner_1" },
    update: { role: UserRole.partner, status: UserStatus.active },
    create: { id: "partner_1", role: UserRole.partner, status: UserStatus.active }
  });
  await prisma.user.upsert({
    where: { id: "cust_1" },
    update: { role: UserRole.customer, status: UserStatus.active },
    create: { id: "cust_1", role: UserRole.customer, status: UserStatus.active }
  });

  await prisma.customer.upsert({
    where: { id: "cust_1" },
    update: { userId: "cust_1", name: "Demo Customer" },
    create: { id: "cust_1", userId: "cust_1", name: "Demo Customer" }
  });

  await prisma.partner.upsert({
    where: { id: "partner_1" },
    update: { userId: "partner_1", name: "Downtown Grooming Co." },
    create: { id: "partner_1", userId: "partner_1", name: "Downtown Grooming Co." }
  });

  await prisma.shop.upsert({
    where: { id: "shop_1" },
    update: { partnerId: "partner_1", name: "Downtown Grooming Co.", rating: 4.8 },
    create: { id: "shop_1", partnerId: "partner_1", name: "Downtown Grooming Co.", rating: 4.8 }
  });
  await prisma.shop.upsert({
    where: { id: "shop_2" },
    update: { partnerId: "partner_1", name: "Riverside Barber Lab", rating: 4.5 },
    create: { id: "shop_2", partnerId: "partner_1", name: "Riverside Barber Lab", rating: 4.5 }
  });

  await prisma.branch.upsert({
    where: { id: "branch_1" },
    update: {
      shopId: "shop_1",
      name: "Downtown Branch",
      zone: "central",
      lat: 13.7563,
      lng: 100.5018,
      openHours: "09:00-20:00",
      capacity: 3
    },
    create: {
      id: "branch_1",
      shopId: "shop_1",
      name: "Downtown Branch",
      zone: "central",
      lat: 13.7563,
      lng: 100.5018,
      openHours: "09:00-20:00",
      capacity: 3
    }
  });
  await prisma.branch.upsert({
    where: { id: "branch_2" },
    update: {
      shopId: "shop_2",
      name: "Riverside Branch",
      zone: "west",
      lat: 13.74,
      lng: 100.48,
      openHours: "10:00-21:00",
      capacity: 2
    },
    create: {
      id: "branch_2",
      shopId: "shop_2",
      name: "Riverside Branch",
      zone: "west",
      lat: 13.74,
      lng: 100.48,
      openHours: "10:00-21:00",
      capacity: 2
    }
  });

  await prisma.service.upsert({
    where: { id: "svc_1" },
    update: { shopId: "shop_1", name: "Haircut", durationMinutes: 45, price: 350, mode: ServiceMode.in_shop },
    create: { id: "svc_1", shopId: "shop_1", name: "Haircut", durationMinutes: 45, price: 350, mode: ServiceMode.in_shop }
  });
  await prisma.service.upsert({
    where: { id: "svc_2" },
    update: { shopId: "shop_1", name: "Beard Trim", durationMinutes: 30, price: 250, mode: ServiceMode.in_shop },
    create: { id: "svc_2", shopId: "shop_1", name: "Beard Trim", durationMinutes: 30, price: 250, mode: ServiceMode.in_shop }
  });
  await prisma.service.upsert({
    where: { id: "svc_3" },
    update: { shopId: "shop_2", name: "Full Grooming", durationMinutes: 60, price: 550, mode: ServiceMode.in_shop },
    create: { id: "svc_3", shopId: "shop_2", name: "Full Grooming", durationMinutes: 60, price: 550, mode: ServiceMode.in_shop }
  });
  await prisma.service.upsert({
    where: { id: "svc_4" },
    update: { shopId: "shop_2", name: "Home Visit Haircut", durationMinutes: 50, price: 700, mode: ServiceMode.delivery },
    create: { id: "svc_4", shopId: "shop_2", name: "Home Visit Haircut", durationMinutes: 50, price: 700, mode: ServiceMode.delivery }
  });

  await prisma.staff.upsert({
    where: { id: "staff_1" },
    update: { shopId: "shop_1", name: "Narin" },
    create: { id: "staff_1", shopId: "shop_1", name: "Narin" }
  });
  await prisma.staff.upsert({
    where: { id: "staff_2" },
    update: { shopId: "shop_1", name: "Korn" },
    create: { id: "staff_2", shopId: "shop_1", name: "Korn" }
  });
  await prisma.staff.upsert({
    where: { id: "staff_3" },
    update: { shopId: "shop_2", name: "Mek" },
    create: { id: "staff_3", shopId: "shop_2", name: "Mek" }
  });

  // Skills: make idempotent via upsert-on-unique.
  const skills: Array<{ staffId: string; skill: string }> = [
    { staffId: "staff_1", skill: "Haircut" },
    { staffId: "staff_1", skill: "Fade" },
    { staffId: "staff_2", skill: "Beard" },
    { staffId: "staff_2", skill: "Styling" },
    { staffId: "staff_3", skill: "Haircut" },
    { staffId: "staff_3", skill: "Color" }
  ];

  for (const entry of skills) {
    await prisma.staffSkill.upsert({
      where: { staffId_skill: { staffId: entry.staffId, skill: entry.skill } },
      update: {},
      create: { staffId: entry.staffId, skill: entry.skill }
    });
  }
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

