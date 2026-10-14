import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  const all = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  console.log("ALL_USERS:", all.length);
  all.forEach(u => console.log(`  ${u.email} | ${u.name} | ${u.role} | ${u.id}`));
  const ali = await prisma.user.findUnique({ where: { email: "ali@test.com" } });
  console.log("ALI_EXISTS:", ali ? "ADA" : "TIADA");
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error("ERR", e.message); await prisma.$disconnect(); process.exit(1); });