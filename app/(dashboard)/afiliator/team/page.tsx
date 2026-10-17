"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, AlertCircle, Trophy, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Member {
  id: string;
  username: string;
  tier: string;
  status: string;
  totalClicks: number;
  totalSales: number;
  totalEarnings: number;
}

interface Level {
  label: string;
  count: number;
  listed: number;
  share: string;
  totalEarnings: number;
  totalClicks: number;
  top: { username: string; tier: string; earnings: number; clicks: number }[];
}

interface TeamData {
  me: { isTeamLeader: boolean };
  levels: { level1: Level; level2: Level; level3: Level };
  members: { level1: Member[]; level2: Member[]; level3: Member[] };
}

const levelColors = ["#FF6B00", "#FF007A", "#7C3AED"];

export default function AffiliateTeamPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    fetch("/api/affiliate/team", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Gagal memuatkan data team."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-textsec shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan team...
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-600">
        <AlertCircle className="h-4 w-4" /> {error || "Ralat."}
      </div>
    );
  }

  const levels = [data.levels.level1, data.levels.level2, data.levels.level3];
  const members = [data.members.level1, data.members.level2, data.members.level3];
  const totalMembers = levels.reduce((a, l) => a + l.count, 0);
  const totalTeamEarnings = levels.reduce((a, l) => a + l.totalEarnings, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
          <span className="text-gradient">Team</span> Saya
        </h1>
        <p className="mt-1 text-sm text-textsec">
          Struktur 3 level — bonus dari platform, bukan dari downline.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-soft">
          <Users className="h-6 w-6 text-primary" />
          <p className="mt-3 font-heading text-3xl font-extrabold">{totalMembers}</p>
          <p className="text-sm font-semibold">Jumlah Ahli Team</p>
        </div>
        <div className="card-soft">
          <TrendingUp className="h-6 w-6 text-success" />
          <p className="mt-3 font-heading text-3xl font-extrabold">
            {formatPrice(totalTeamEarnings)}
          </p>
          <p className="text-sm font-semibold">Pendapatan Team</p>
        </div>
        <div className="card-soft">
          <Trophy className={`h-6 w-6 ${data.me.isTeamLeader ? "text-amber-500" : "text-textsec"}`} />
          <p className="mt-3 font-heading text-3xl font-extrabold">
            {data.me.isTeamLeader ? "Ya" : "Belum"}
          </p>
          <p className="text-sm font-semibold">Status Team Leader</p>
          <p className="text-xs text-textsec">Syarat: 5,000 klik + 30 jualan</p>
        </div>
      </div>

      {/* Level cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {levels.map((l, i) => (
          <button
            key={l.label}
            onClick={() => setTab((i + 1) as 1 | 2 | 3)}
            className={`rounded-2xl border p-5 text-left transition-all ${
              tab === i + 1 ? "border-transparent shadow-soft-lg" : "border-gray-100 bg-white"
            }`}
            style={tab === i + 1 ? { backgroundColor: `${levelColors[i]}0d`, borderColor: levelColors[i] } : {}}
          >
            <span
              className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: levelColors[i] }}
            >
              {l.label}
            </span>
            <p className="mt-3 font-heading text-3xl font-extrabold">{l.count}</p>
            <p className="text-xs text-textsec">ahli • agihan {l.share}</p>
            <p className="mt-1 text-xs font-semibold text-success">
              {formatPrice(l.totalEarnings)}
            </p>
          </button>
        ))}
      </div>

      {/* Senarai ahli */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-bold">
          Ahli {levels[tab - 1].label} ({members[tab - 1].length})
        </h2>
        {members[tab - 1].length === 0 ? (
          <p className="mt-4 rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">
            Belum ada ahli di level ini. Kongsi kod rujukan anda untuk bina team.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-wider text-textsec">
                  <th className="pb-2">Username</th>
                  <th className="pb-2">Tier</th>
                  <th className="pb-2 text-right">Klik</th>
                  <th className="pb-2 text-right">Jualan</th>
                  <th className="pb-2 text-right">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members[tab - 1].map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 font-semibold">@{m.username}</td>
                    <td className="py-2.5 text-textsec">{m.tier}</td>
                    <td className="py-2.5 text-right">{m.totalClicks}</td>
                    <td className="py-2.5 text-right">{m.totalSales}</td>
                    <td className="py-2.5 text-right font-semibold text-success">
                      {formatPrice(m.totalEarnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
