import { RoleGate } from "@/components/auth/RoleGate";

export default function ClientAreaLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <RoleGate mode="client">{children}</RoleGate>;
}
