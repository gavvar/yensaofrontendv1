"use client";

import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { ReactNode } from "react";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
