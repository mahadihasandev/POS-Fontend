import React from "react";
import { Database, Shield, Zap } from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const stats: StatItem[] = [
  {
    icon: <Shield className="w-4 h-4 text-emerald-400" />,
    value: "AES-256",
    label: "At-Rest Disk Cipher",
  },
  {
    icon: <Zap className="w-4 h-4 text-violet-400" />,
    value: "< 10ms",
    label: "Redis L1/L2 Latency",
  },
  {
    icon: <Database className="w-4 h-4 text-indigo-400" />,
    value: "100%",
    label: "Type-Safe Contracts",
  },
];

export function HeroStats() {
  return (
    <div className="grid grid-cols-3 gap-3 pt-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm"
        >
          <div className="flex items-center gap-1.5 mb-1">
            {stat.icon}
            <Heading as="h4" size="h4" className="text-white">
              {stat.value}
            </Heading>
          </div>
          <Text variant="small" className="text-slate-400 line-clamp-1">
            {stat.label}
          </Text>
        </div>
      ))}
    </div>
  );
}
