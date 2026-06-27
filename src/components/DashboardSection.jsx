import { Navigate } from 'react-router-dom';
import { Auth } from '../pages/Auth';
import { Dashboard } from '../pages/Dashboard';
import { useAuth } from '../context/AuthContext';

export function DashboardSection() {
  const { user, isLoading } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user) {
    return (
      <section className="min-h-screen bg-zinc-100 border-t border-zinc-200 pt-24 pb-12">
        <Dashboard />
      </section>
    );
  }

  // While auth is resolving, show a small spinner inside the auth card area
  // instead of a full-screen block that looks permanently stuck.
  if (isLoading) {
    return (
      <section className="min-h-screen bg-zinc-100 border-t border-zinc-200 pt-24 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-zinc-100 border-t border-zinc-200 pt-24 pb-12">
      <Auth />
    </section>
  );
}
