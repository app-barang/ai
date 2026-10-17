import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TrendingUp, Link2, Wallet, Users, ArrowRight } from "lucide-react";

export default async function AffiliateDashboardPlaceholder() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "Afiliator";

  const links = [
    { href: "/afiliator/link", label: "Link Afiliasi", icon: Link2 },
    { href: "/afiliator/wallet", label: "Wallet", icon: Wallet },
    { href: "/afiliator/team", label: "Team", icon: Users },
  ];

  return (
    <div className="min-h-[80vh] bg-bgalt py-10">
      <div className="container-custom max-w-3xl">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-soft">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
            <TrendingUp className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-extrabold md:text-3xl">
            Selamat datang, <span className="text-gradient">{name}</span>
          </h1>
          <p className="mt-2 text-sm text-textsec">
            Dashboard afiliator sedang dibina. API sudah sedia — UI penuh akan menyusul.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-bgalt px-4 py-3 text-sm font-semibold transition-colors hover:border-primary"
              >
                <span className="flex items-center gap-2">
                  <l.icon className="h-4 w-4 text-primary" /> {l.label}
                </span>
                <ArrowRight className="h-4 w-4 text-textsec" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
