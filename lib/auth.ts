// NextAuth Configuration - barangviral.store
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma, { withDbRetry } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/masuk",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Kelayakan",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata Laluan", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan kata laluan diperlukan");
        }

        // Retry automatik bila sambungan Supabase intermittent
        const user = await withDbRetry(() =>
          prisma.user.findUnique({
            where: { email: credentials.email },
          })
        );

        if (!user || !user.password) {
          throw new Error("Pengguna tidak dijumpai");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Kata laluan salah");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token?.id) {
        // Ambil role + id affiliate/merchant (retry bila sambungan intermittent)
        const dbUser = await withDbRetry(() =>
          prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              affiliate: { select: { id: true } },
              merchant: { select: { id: true } },
            },
          })
        ).catch(() => null);
        if (dbUser) {
          token.role = dbUser.role;
          token.affiliateId = dbUser.affiliate?.id ?? null;
          token.merchantId = dbUser.merchant?.id ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          id?: string;
          role?: string;
          affiliateId?: string | null;
          merchantId?: string | null;
        };
        u.id = token.id as string;
        u.role = token.role as string;
        u.affiliateId = (token.affiliateId as string | null) ?? null;
        u.merchantId = (token.merchantId as string | null) ?? null;
      }
      return session;
    },
  },
};
