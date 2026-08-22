"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const IntroContext = createContext(false);

export function IntroProvider({ children, ready }: { children: ReactNode; ready: boolean }) {
  return <IntroContext.Provider value={ready}>{children}</IntroContext.Provider>;
}

export function useIntroReady() {
  return useContext(IntroContext);
}
