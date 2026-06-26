import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, CalendarDays, Clock, AlertCircle, Loader2 } from 'lucide-react';

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const today = new Date().toISOString();

        const [usersRes, bookingsRes, upcomingRes, pendingRes, recentRes] =
          await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('bookings').select('id', { count: 'exact', head: true }),
            supabase
              .from('bookings')
              .select('id', { count: 'exact', head: true })
              .gte('date', today),
            supabase
              .from('bookings')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'Pending'),
            supabase
              .from('bookings')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(5),
          ]);

        setStats({
          totalUsers: usersRes.count ?? 0,
          totalBookings: bookingsRes.count ?? 0,
          upcomingBookings: upcomingRes.count ?? 0,
          pendingBookings: pendingRes.count ?? 0,
        });

        setRecentBookings(recentRes.data || []);
      } catch (err) {
        console.error('Overview fetch error:', err);
        setError(err.message || 'Failed to load overview data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#D4AF37' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="border px-6 py-4 text-sm"
        style={{ borderColor: '#E5DCC5', color: '#8B0000', background: '#FFFFFF' }}
      >
        {error}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
    },
    {
      label: 'Total Reservations',
      value: stats.totalBookings,
      icon: CalendarDays,
    },
    {
      label: 'Upcoming',
      value: stats.upcomingBookings,
      icon: Clock,
    },
    {
      label: 'Pending',
      value: stats.pendingBookings,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="border px-6 py-5"
              style={{ borderColor: '#E5DCC5', background: '#FFFFFF' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: '#6B6B6B' }}
                >
                  {card.label}
                </p>
                <Icon className="w-4 h-4" style={{ color: '#D4AF37' }} />
              </div>
              <p
                className="text-3xl font-semibold"
                style={{ color: '#1A1A1A' }}
              >
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div>
        <h3
          className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
          style={{ color: '#6B6B6B' }}
        >
          Recent Bookings
        </h3>
        <div
          className="border overflow-hidden"
          style={{ borderColor: '#E5DCC5', background: '#FFFFFF' }}
        >
          {recentBookings.length === 0 ? (
            <p
              className="px-6 py-12 text-center text-sm"
              style={{ color: '#6B6B6B' }}
            >
              No bookings yet.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: '#E5DCC5' }}
                >
                  {['Client', 'Event', 'Date', 'Package', 'Status'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: '#6B6B6B' }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b last:border-b-0"
                    style={{ borderColor: '#E5DCC5' }}
                  >
                    <td className="px-6 py-4">
                      <p
                        className="text-sm font-medium"
                        style={{ color: '#1A1A1A' }}
                      >
                        {b.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: '#6B6B6B' }}
                      >
                        {b.email}
                      </p>
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: '#1A1A1A' }}
                    >
                      {b.event_type || '—'}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: '#1A1A1A' }}
                    >
                      {b.booking_date
                        ? new Date(b.booking_date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 border"
                        style={{ borderColor: '#E5DCC5', color: '#6B6B6B' }}
                      >
                        {b.package_id || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
    Confirmed: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
    Completed: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    Cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  };

  const s = styles[status] || styles.Pending;

  return (
    <span
      className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 border inline-block"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {status || 'Pending'}
    </span>
  );
}
