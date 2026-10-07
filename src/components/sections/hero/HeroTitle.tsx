import React from "react";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Heading, Text } from "@/components/ui/typography";

export function HeroTitle() {
  return (
    <div className="space-y-4">
      {/* Category / Stack Pill Component */}
      <Badge variant="indigo" pulse>
        <Zap className="w-3.5 h-3.5 text-indigo-400" />
        <span>Next.js App Router + Redux Toolkit + RTK Query</span>
      </Badge>

      {/* Main Title Component */}
      <Heading as="h1" size="h1" className="leading-tight">
        Next-Generation Cloud Drive{" "}
        <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
          Frontend Architecture
        </span>
      </Heading>

      {/* Lead / Normal Text Component */}
      <Text variant="lead">
        A strictly modular, enterprise-grade architecture with centralized Redux
        state, dynamic RTK Query API slice, cookies-next token persistence, and
        Zod-powered type-safe forms.
      </Text>
    </div>
  );
}
