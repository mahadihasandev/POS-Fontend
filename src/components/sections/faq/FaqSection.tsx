"use client";

import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Heading, Text } from "@/components/ui/typography";

const faqItems = [
  {
    id: "item-1",
    question: "How does the RTK Query Base API handle authentication headers?",
    answer:
      "baseApi utilizes a prepareHeaders callback that reads the Bearer token directly from cookies via cookies-next (e.g. getCookie('token')). When present, it automatically attaches 'Authorization: Bearer <token>' to every outgoing mutation and query without manual boilerplate.",
  },
  {
    id: "item-2",
    question: "Why does ReduxProvider use lazy state initialization?",
    answer:
      "In Next.js App Router and React 19, accessing refs during render triggers strict compiler and hook warnings. Using useState(() => makeStore()) guarantees the Redux store is lazily initialized exactly once per client component mount without state leakage across requests.",
  },
  {
    id: "item-3",
    question: "What is the componentization rule followed in this project?",
    answer:
      "We follow the 'Everything is a Component' rule: all UI elements—from typography (Heading, Text) to design system primitives (Button, Card, Accordion, Badge, Input) and page sections (HeroSection, HeroTitle, HeroImageCard, FeatureGrid)—are isolated into dedicated, testable components.",
  },
  {
    id: "item-4",
    question: "How are Next.js fonts and images optimized?",
    answer:
      "Fonts are imported via next/font/google in the root layout with font-display swap and CSS variables. Images are rendered using next/image with explicit responsive dimensions and priority flags for above-the-fold assets to maximize Core Web Vitals.",
  },
];

export function FaqSection() {
  return (
    <section className="py-12 border-t border-slate-850">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 space-y-2">
          <Heading as="h2" size="h2">
            Frequently Asked Questions
          </Heading>
          <Text variant="muted">
            Key architectural decisions behind our Next.js App Router and Redux setup.
          </Text>
        </div>

        <Accordion type="single" defaultValue="item-1">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
