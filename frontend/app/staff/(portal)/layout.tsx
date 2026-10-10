import { StaffShell } from '@/components/staff/StaffShell';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell>{children}</StaffShell>;
}
