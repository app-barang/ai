"use client";

import { useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import RadarWidget from "@/components/home/RadarWidget";
import WhyUsSection from "@/components/home/WhyUsSection";
import CategoryFilter from "@/components/home/CategoryFilter";
import ProductGrid from "@/components/home/ProductGrid";
import TrendingSection from "@/components/home/TrendingSection";
import AffiliateBanner from "@/components/home/AffiliateBanner";
import { Flame } from "lucide-react";

export default function HomePage() {
  const [category, setCategory] = useState("Semua");

  return (
    <>
      <HeroSection />
      <RadarWidget />

      {/* Produk */}
      <section id="produk" className="bg-bgalt py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Flame className="h-3.5 w-3.5" /> Paling Laris
            </span>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-4xl">
              Produk <span className="text-gradient">Viral</span> Minggu Ini
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-textsec">
              Setiap produk disemak oleh Radar AI + pasukan kami sebelum
              disenaraikan.
            </p>
          </div>

          <div className="mb-8 flex justify-center">
            <CategoryFilter active={category} onChange={setCategory} />
          </div>

          <ProductGrid category={category} />
        </div>
      </section>

      <TrendingSection />
      <WhyUsSection />
      <AffiliateBanner />
    </>
  );
}
