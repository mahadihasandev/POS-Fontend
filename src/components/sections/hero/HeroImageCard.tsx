import React from "react";
import Image from "next/image";
import { ShieldCheck, HardDrive, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface HeroImageCardProps {
  imageSrc?: string;
  altText?: string;
}

/**
 * Dedicated Hero Image Card component leveraging Next.js Image optimization,
 * priority LCP loading, and subtle glassmorphic overlay indicators.
 */
export function HeroImageCard({
  imageSrc = "/images/drive-preview.jpg",
  altText = "Drive App Dashboard preview with dark glassmorphic file storage interface",
}: HeroImageCardProps) {
  return (
    <div className="relative group w-full rounded-2xl p-2 bg-gradient-to-b from-indigo-500/20 via-slate-800/40 to-slate-900/60 border border-slate-750 shadow-2xl backdrop-blur-xl">
      {/* Decorative ambient neon background */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-700 -z-10" />

      {/* Floating Status Badges */}
      <div className="absolute top-5 left-5 z-20 flex flex-wrap gap-2">
        <Badge variant="emerald" pulse>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AES-256 Encrypted</span>
        </Badge>
        <Badge variant="indigo" className="hidden sm:inline-flex">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span>1.2 TB Quota</span>
        </Badge>
      </div>

      <div className="absolute bottom-5 right-5 z-20 hidden sm:flex">
        <Badge variant="violet">
          <Cpu className="w-3.5 h-3.5 text-violet-400" />
          <span>Sub-10ms Redis L1/L2</span>
        </Badge>
      </div>

      {/* Optimized Next.js Image */}
      <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-[16/9] w-full">
        <Image
          src={imageSrc}
          alt={altText}
          width={1280}
          height={720}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
