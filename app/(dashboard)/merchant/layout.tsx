import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MerchantShell from "@/components/merchant/MerchantShell";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/masuk");

  const user = session.user as { id?: string; name?: string | null; merchantId?: string | null };

  // Ambil maklumat merchant untuk shell (jika ada)
  let businessName = user.name ?? "Merchant";
  let tier = "STARTER";
  let status = "PENDING";

  if (user.merchantId) {
    const merchant = await prisma.merchant
      .findUnique({
        where: { id: user.merchantId },
        select: { businessName: true, tier: true, status: true },
      })
      .catch(() => null);
    if (merchant) {
      businessName = merchant.businessName;
      tier = merchant.tier;
      status = merchant.status;
    }
  }

  return (
    <MerchantShell
      name={user.name ?? "Merchant"}
      businessName={businessName}
      tier={tier}
      status={status}
    >
      {children}
    </MerchantShell>
  );
}
