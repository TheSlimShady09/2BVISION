import React, { useState, useEffect } from 'react';
import { Auth } from '../pages/Auth';
import { Dashboard } from '../pages/Dashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export function DashboardSection() {
  const { user, isLoading } = useAuth();

  // ── Independent role fetch ────────────────────────────────────────────────
  // Don't rely on AuthContext's user.role — it can silently fall back to
  // 'client' when the profiles fetch races or fails.
  const [verifiedRole, setVerifiedRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !user) {
      setRoleLoading(false);
      return;
    }

    let cancelled = false;

    const fetchRole = async () => {
      setRoleLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (cancelled) return;

        if (error) {
          console.warn('DashboardSection role fetch warning:', error.message);
          setVerifiedRole('client');
        } else {
          setVerifiedRole(data?.role ?? 'client');
        }
      } catch (err) {
        console.error('DashboardSection role fetch error:', err);
        if (!cancelled) setVerifiedRole('client');
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    };

    fetchRole();
    return () => { cancelled = true; };
  }, [user?.id, isLoading]);

  // Show spinner while auth or role is loading
  if (isLoading || roleLoading) {
    return (
      <section className="min-h-screen bg-zinc-100 border-t border-zinc-200 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-slate-300" />
      </section>
    );
  }

  // Not logged in → show login form
  if (!user) {
    return (
      <section className="min-h-screen bg-zinc-100 border-t border-zinc-200 pt-24 pb-12">
        <Auth />
      </section>
    );
  }

  // Admin → admin dashboard
  if (verifiedRole === 'admin') {
    return <AdminDashboard />;
  }

  // Regular client → client dashboard
  return (
    <section className="min-h-screen bg-zinc-100 border-t border-zinc-200 pt-24 pb-12">
      <Dashboard />
    </section>
  );
}
