"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/redux/store";

interface ReduxProviderProps {
  children: React.ReactNode;
}

/**
 * Client-side Redux Provider wrapper that guarantees a stable store instance
 * per client session without breaking Next.js App Router Server Components
 * or violating React 19 strict render rules.
 */
export default function ReduxProvider({ children }: ReduxProviderProps) {
  // Lazy-initialize the store instance once using useState initializer
  const [store] = useState<AppStore>(() => makeStore());

  return <Provider store={store}>{children}</Provider>;
}
