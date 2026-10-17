import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AffiliateShell from "@/components/affiliate/AffiliateShell";

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/masuk");

  const user = session.user as {
    id?: string;
    name?: string | null;
    affiliateId?: string | null;
  };

  let username = user.name ?? "afiliator";
  let tier = "BRONZE";
  let balance = 0;

  if (user.affiliateId) {
    const aff = await prisma.affiliate
      .findUnique({
        where: { id: user.affiliateId },
        select: { username: true, tier: true, balance: true },
      })
      .catch(() => null);
    if (aff) {
      username = aff.username;
      tier = aff.tier;
      balance = aff.balance;
    }
  }

  return (
    <AffiliateShell
      name={user.name ?? "Afiliator"}
      username={username}
      tier={tier}
      balance={balance}
    >
      {children}
    </AffiliateShell>
  );
}
