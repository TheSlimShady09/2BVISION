import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_STYLES = {
  Pending: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  Confirmed: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  Completed: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  Cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
};

export function AdminReservations() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchErr } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;
        setBookings(data || []);
      } catch (err) {
        console.error('Bookings fetch error:', err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateErr) throw updateErr;

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to update status');
    } finally {
      setOpenDropdown(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (b.name || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.phone || '').toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm" style={{ color: '#6B6B6B' }}>
          {filteredBookings.length} reservation{filteredBookings.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border px-3 py-2 focus:outline-none appearance-none cursor-pointer"
            style={{
              borderColor: '#E5DCC5',
              background: '#FFFFFF',
              color: '#1A1A1A',
            }}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#6B6B6B' }}
            />
            <input
              type="text"
              placeholder="Search clients…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border focus:outline-none"
              style={{
                borderColor: '#E5DCC5',
                background: '#FFFFFF',
                color: '#1A1A1A',
                width: '240px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="border overflow-x-auto"
        style={{ borderColor: '#E5DCC5', background: '#FFFFFF' }}
      >
        {filteredBookings.length === 0 ? (
          <p
            className="px-6 py-12 text-center text-sm"
            style={{ color: '#6B6B6B' }}
          >
            No reservations found.
          </p>
        ) : (
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b" style={{ borderColor: '#E5DCC5' }}>
                {[
                  'Client',
                  'Phone',
                  'Event',
                  'Package',
                  'Date & Time',
                  'Status',
                  'Notes',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: '#6B6B6B' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const s = STATUS_STYLES[b.status] || STATUS_STYLES.Pending;
                const isDropdownOpen = openDropdown === b.id;

                return (
                  <tr
                    key={b.id}
                    className="border-b last:border-b-0"
                    style={{ borderColor: '#E5DCC5' }}
                  >
                    {/* Client */}
                    <td className="px-5 py-4">
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

                    {/* Phone */}
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: '#1A1A1A' }}
                    >
                      {b.phone || '—'}
                    </td>

                    {/* Event */}
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: '#1A1A1A' }}
                    >
                      {b.event_type || '—'}
                    </td>

                    {/* Package */}
                    <td className="px-5 py-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 border inline-block"
                        style={{ borderColor: '#E5DCC5', color: '#6B6B6B' }}
                      >
                        {b.package_id || '—'}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-4">
                      <p
                        className="text-sm"
                        style={{ color: '#1A1A1A' }}
                      >
                        {b.booking_date
                          ? new Date(b.booking_date).toLocaleDateString()
                          : '—'}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: '#6B6B6B' }}
                      >
                        {b.time || '—'}
                      </p>
                    </td>

                    {/* Status with dropdown */}
                    <td className="px-5 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(isDropdownOpen ? null : b.id);
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 border cursor-pointer"
                          style={{
                            background: s.bg,
                            color: s.color,
                            borderColor: s.border,
                          }}
                        >
                          {b.status || 'Pending'}
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {isDropdownOpen && (
                          <div
                            className="absolute top-full left-0 mt-1 w-36 border z-30"
                            style={{
                              background: '#FFFFFF',
                              borderColor: '#E5DCC5',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => updateStatus(b.id, opt)}
                                disabled={b.status === opt}
                                className="w-full text-left px-4 py-2 text-xs font-medium transition-colors disabled:opacity-40"
                                style={{
                                  color: b.status === opt ? '#6B6B6B' : '#1A1A1A',
                                }}
                                onMouseEnter={(e) => {
                                  if (b.status !== opt) e.target.style.background = '#FAF9F6';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'transparent';
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="px-5 py-4">
                      <p
                        className="text-xs max-w-[160px] truncate"
                        style={{ color: '#6B6B6B' }}
                        title={b.notes || ''}
                      >
                        {b.notes || '—'}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
