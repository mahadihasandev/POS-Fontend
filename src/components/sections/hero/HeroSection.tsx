import React from "react";
import { HeroTitle } from "./HeroTitle";
import { HeroStats } from "./HeroStats";
import { HeroImageCard } from "./HeroImageCard";
import LoginForm from "@/components/example/LoginForm";

export function HeroSection() {
  return (
    <section className="py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Title, Stats, and Dashboard Image Preview */}
        <div className="lg:col-span-7 space-y-6">
          <HeroTitle />
          <HeroStats />
          <HeroImageCard />
        </div>

        {/* Right Column: Interactive Zod + RTK Query Form Component */}
        <div className="lg:col-span-5 flex justify-center">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
