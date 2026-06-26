import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Auth } from './Auth';
import { AdminLayout } from './admin/AdminLayout';

export function AdminDashboard() {
  const { user, isLoading: authIsLoading, logout } = useAuth();

  // ── Derived state from AuthContext ─────────────────────────────────────────
  const verifiedRole = user?.role || null;
  const roleLoading = authIsLoading;

  // ── Loading: auth check ────────────────────────────────────────────────────
  if (authIsLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: '#FAF9F6' }}
      >
        <Loader2 className="w-6 h-6 animate-spin mb-4" style={{ color: '#D4AF37' }} />
        <p
          className="text-[10px] uppercase tracking-[0.2em] font-bold"
          style={{ color: '#6B6B6B' }}
        >
          Verifying Session…
        </p>
      </div>
    );
  }


  // ── Auth Gate: show login ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center py-16"
        style={{ background: '#FAF9F6' }}
      >
        <Auth isAdmin={true} />
      </div>
    );
  }

  // ── Loading: role check ────────────────────────────────────────────────────
  if (roleLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: '#FAF9F6' }}
      >
        <Loader2 className="w-6 h-6 animate-spin mb-4" style={{ color: '#D4AF37' }} />
        <p
          className="text-[10px] uppercase tracking-[0.2em] font-bold"
          style={{ color: '#6B6B6B' }}
        >
          Checking Permissions…
        </p>
      </div>
    );
  }

  // ── Access Denied ──────────────────────────────────────────────────────────
  if (verifiedRole !== 'admin') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: '#FAF9F6' }}
      >
        <h1
          className="text-xl font-semibold tracking-[0.2em] uppercase mb-8"
          style={{ color: '#1A1A1A' }}
        >
          Access Denied
        </h1>
        <div
          className="border px-8 py-6 text-sm max-w-md w-full"
          style={{ borderColor: '#E5DCC5', background: '#FFFFFF', color: '#1A1A1A' }}
        >
          <p className="mb-2">
            <span style={{ color: '#6B6B6B' }}>Email:</span>{' '}
            <span className="font-medium">{user.email}</span>
          </p>
          <p>
            <span style={{ color: '#6B6B6B' }}>Role:</span>{' '}
            <span className="font-medium">{verifiedRole || 'None'}</span>
          </p>
        </div>
        <div className="flex items-center gap-6 mt-8">
          <a
            href="/"
            className="text-xs font-bold uppercase tracking-[0.15em] transition-colors"
            style={{ color: '#6B6B6B' }}
          >
            Home
          </a>
          <button
            onClick={logout}
            className="text-xs font-bold uppercase tracking-[0.15em] transition-colors"
            style={{ color: '#8B0000' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ── Authenticated Admin — render isolated layout ───────────────────────────
  return <AdminLayout onLogout={logout} />;
}
