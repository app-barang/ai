import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findUnique({
    where: { email: "debug@test.com" },
    select: { id: true, name: true, email: true, role: true, password: true },
  });
  if (!u) {
    console.log("DEBUG_USER: TIADA");
    return;
  }
  const ok = u.password ? await bcrypt.compare("Test123456", u.password) : false;
  const wrong = u.password ? await bcrypt.compare("salah12345", u.password) : false;
  console.log("DEBUG_USER: WUJUD | role:", u.role, "| password bcrpt-test (betul):", ok, "| (salah):", wrong);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error("ERR", e.message); await prisma.$disconnect(); process.exit(1); });
