import { PublicShell } from '@/components/public/PublicShell';

/** Public website chrome. The staff portal lives under /staff with its own layout and is not linked from here. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
