import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  description: string;
}

export function FeatureCard({ icon, title, badge, description }: FeatureCardProps) {
  return (
    <Card className="hover:border-slate-700/80 transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
            {icon}
          </div>
          {badge && <Badge variant="default">{badge}</Badge>}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-1 w-12 bg-indigo-500/20 group-hover:w-full group-hover:bg-indigo-500 transition-all duration-300 rounded-full" />
      </CardContent>
    </Card>
  );
}
