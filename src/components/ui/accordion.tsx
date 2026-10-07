"use client";

import React, { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionVariant = "default" | "bordered" | "glass" | "subtle";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
  variant?: AccordionVariant;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

export interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  variant?: AccordionVariant;
  className?: string;
  children: React.ReactNode;
}

export function Accordion({
  type = "single",
  defaultValue,
  variant = "default",
  className,
  children,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      if (type === "single") {
        return prev.includes(value) ? [] : [value];
      }
      return prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type, variant }}>
      <div className={cn("space-y-3", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextType {
  value: string;
  isOpen: boolean;
  variant: AccordionVariant;
}

const AccordionItemContext = createContext<AccordionItemContextType | null>(null);

export interface AccordionItemProps {
  value: string;
  className?: string;
  variant?: AccordionVariant;
  children: React.ReactNode;
}

export function AccordionItem({
  value,
  className,
  variant: itemVariant,
  children,
}: AccordionItemProps) {
  const accordion = useContext(AccordionContext);
  const isOpen = accordion?.openItems.includes(value) ?? false;
  const variant = itemVariant || accordion?.variant || "default";

  const variantStyles = {
    default: cn(
      "rounded-xl border border-slate-200 bg-white shadow-2xs transition-all duration-300",
      "hover:border-slate-300 hover:shadow-xs",
      isOpen && "border-blue-300 ring-2 ring-blue-500/10 shadow-sm"
    ),
    bordered: cn(
      "rounded-xl border-2 border-slate-200 bg-white transition-all duration-300",
      "hover:border-slate-300",
      isOpen && "border-blue-500 shadow-xs"
    ),
    glass: cn(
      "rounded-xl border border-white/20 bg-white/70 backdrop-blur-md shadow-xs transition-all duration-300",
      "hover:bg-white/90 hover:border-white/30",
      isOpen && "border-blue-400/50 bg-white/95 ring-2 ring-blue-500/15"
    ),
    subtle: cn(
      "rounded-xl border border-transparent bg-slate-50 transition-all duration-300",
      "hover:bg-slate-100/80",
      isOpen && "bg-slate-100 border-slate-200"
    ),
  };

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, variant }}>
      <div
        className={cn(
          "overflow-hidden group",
          variantStyles[variant],
          className
        )}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps {
  className?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export function AccordionTrigger({
  className,
  icon,
  badge,
  children,
}: AccordionTriggerProps) {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error("AccordionTrigger must be used within AccordionItem");
  }

  const { isOpen } = item;

  return (
    <button
      type="button"
      onClick={() => accordion.toggleItem(item.value)}
      className={cn(
        "w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer select-none",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/40",
        isOpen ? "text-slate-950 font-bold" : "text-slate-800 font-semibold hover:text-slate-950",
        className
      )}
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200",
              isOpen ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/80 group-hover:text-slate-800"
            )}
          >
            {icon}
          </div>
        )}
        <span className="text-sm tracking-tight truncate">{children}</span>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ml-2",
          isOpen
            ? "bg-blue-50 text-blue-600 rotate-180"
            : "bg-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200/60"
        )}
      >
        <ChevronDown className="w-4 h-4 stroke-[2.2]" />
      </div>
    </button>
  );
}

export interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

export function AccordionContent({
  className,
  children,
}: AccordionContentProps) {
  const item = useContext(AccordionItemContext);

  if (!item) {
    throw new Error("AccordionContent must be used within AccordionItem");
  }

  const { isOpen } = item;

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden min-h-0">
        <div
          className={cn(
            "px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
