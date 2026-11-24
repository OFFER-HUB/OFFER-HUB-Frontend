import { RoleGate } from "@/components/auth/RoleGate";

export default function FreelancerAreaLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <RoleGate mode="freelancer">{children}</RoleGate>;
}
