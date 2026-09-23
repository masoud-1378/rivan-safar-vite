'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-muted-foreground">
      <LogOut />
      خروج
    </Button>
  );
}
