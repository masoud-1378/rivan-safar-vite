'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase-client';

export default function AdminSignOut() {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };
  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full px-3 py-2.5 rounded-control text-body-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors text-right"
    >
      خروج
    </button>
  );
}
