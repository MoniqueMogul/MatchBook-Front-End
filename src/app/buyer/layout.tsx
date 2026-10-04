import type { ReactNode } from "react";
import BuyerRouteGuard from "@/components/common/BuyerRouteGuard";

export default function Layout({ children }: { children: ReactNode }) {
  return <BuyerRouteGuard>{children}</BuyerRouteGuard>;
}
