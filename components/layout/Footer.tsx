import Link from "next/link";
import { Flame, Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-secondary text-white">
      <div className="container-custom py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                <Flame className="h-5 w-5 text-white" />
              </span>
              <span className="font-heading text-xl font-extrabold">
                Barang<span className="text-gradient">Viral</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              &quot;Viral? Kami Semak Dulu.&quot; Platform kurasi produk viral
              dengan Radar AI dan komisen afiliasi sehingga 50%.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-primary hover:shadow-glow"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-heading font-semibold">Penerokaan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/#produk" className="hover:text-primary">Produk Viral</Link></li>
              <li><Link href="/radar" className="hover:text-primary">Radar AI</Link></li>
              <li><Link href="/afiliator" className="hover:text-primary">Program Afiliasi</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading font-semibold">Sokongan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/masuk" className="hover:text-primary">Masuk</Link></li>
              <li><Link href="/daftar" className="hover:text-primary">Daftar</Link></li>
              <li><span className="hover:text-primary">Dasar Privasi</span></li>
              <li><span className="hover:text-primary">Terma Perkhidmatan</span></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading font-semibold">Hubungi Kami</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> sokongan@barangviral.store
              </li>
              <li className="text-gray-500">Kuala Lumpur, Malaysia</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-500 md:flex-row">
          <p className="text-center md:text-left">© {new Date().getFullYear()} BarangViral.store. Hak cipta terpelihara.</p>
          <p className="flex items-center gap-1 text-center md:text-right">
            Dibina dengan <span className="text-gradient font-semibold">Radar AI</span> untuk rakyat Malaysia 🇲🇾
          </p>
        </div>
      </div>
    </footer>
  );
}
