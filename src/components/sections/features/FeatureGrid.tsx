import React from "react";
import { Database, ShieldCheck, Layers, Code2 } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { Heading, Text } from "@/components/ui/typography";

const features = [
  {
    icon: <Database className="w-5 h-5" />,
    title: "RTK Query Base Slice",
    badge: "Core State",
    description:
      "Dynamic baseUrl with automatic Bearer token injection from cookies-next and centralized cache invalidation tags.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    title: "Type-Safe Validation",
    badge: "Forms",
    description:
      "React Hook Form combined with Zod schemas for compile-time validation, dynamic error feedback, and sanitized inputs.",
  },
  {
    icon: <Layers className="w-5 h-5 text-cyan-400" />,
    title: "App Router Compatible",
    badge: "Architecture",
    description:
      "ReduxProvider client component isolates state to the client subtree without breaking Server Components or SSR hydration.",
  },
  {
    icon: <Code2 className="w-5 h-5 text-violet-400" />,
    title: "Modular Components",
    badge: "Design System",
    description:
      "Strict separation of UI primitives (Button, Card, Accordion, Typography) and dedicated section components.",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-12 border-t border-slate-850">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <Heading as="h2" size="h2">
          Engineered for Reliability & Scale
        </Heading>
        <Text variant="muted">
          Every piece of the stack is decoupled, modularized, and strictly typed.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} />
        ))}
      </div>
    </section>
  );
}
