import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/masuk");
  const user = session.user as { name?: string | null; role?: string };
  if (user.role !== "ADMIN") redirect("/");

  return <AdminShell name={user.name ?? "Admin"}>{children}</AdminShell>;
}
