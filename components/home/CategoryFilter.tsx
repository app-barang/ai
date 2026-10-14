"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Smartphone,
  Home,
  Shirt,
  Utensils,
  Dumbbell,
  Car,
  Baby,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Semua", icon: LayoutGrid },
  { name: "Kecantikan", icon: Sparkles },
  { name: "Gajet", icon: Smartphone },
  { name: "Rumah", icon: Home },
  { name: "Fesyen", icon: Shirt },
  { name: "Makanan", icon: Utensils },
  { name: "Sukan", icon: Dumbbell },
  { name: "Automotif", icon: Car },
  { name: "Bayi", icon: Baby },
];

interface Props {
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => onChange(cat.name)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105",
              isActive
                ? "border-transparent bg-gradient-brand text-white shadow-glow"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {cat.name}
            {isActive && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 -z-10 rounded-xl"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
