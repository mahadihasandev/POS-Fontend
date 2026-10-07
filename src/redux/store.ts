import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";

/**
 * Factory function to create a new Redux store instance.
 * Essential for Next.js App Router SSR/hydration to avoid leaking state across requests.
 */
export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

  setupListeners(store.dispatch);
  return store;
};

// Singleton store instance for direct client-side consumption when needed
export const store = makeStore();

// Inferred Redux store types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Re-export hooks for convenient single-point import
export { useAppDispatch, useAppSelector, useAppStore } from "./hooks";
