import { Suspense } from 'react';
import { StaffLogin } from '@/components/staff/StaffLogin';

export const metadata = { title: 'Sign in' };

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<main className="staff-login" />}>
      <StaffLogin />
    </Suspense>
  );
}
