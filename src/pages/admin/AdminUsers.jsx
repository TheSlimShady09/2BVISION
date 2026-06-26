import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Search } from 'lucide-react';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;
        setUsers(data || []);
      } catch (err) {
        console.error('Users fetch error:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
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
      {/* Search */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#6B6B6B' }}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} registered
        </p>
        <div className="relative">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#6B6B6B' }}
          />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border focus:outline-none"
            style={{
              borderColor: '#E5DCC5',
              background: '#FFFFFF',
              color: '#1A1A1A',
              width: '280px',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="border overflow-hidden"
        style={{ borderColor: '#E5DCC5', background: '#FFFFFF' }}
      >
        {filteredUsers.length === 0 ? (
          <p
            className="px-6 py-12 text-center text-sm"
            style={{ color: '#6B6B6B' }}
          >
            No users found.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: '#E5DCC5' }}>
                {['Name', 'Email', 'Role', 'Joined'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: '#6B6B6B' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b last:border-b-0"
                  style={{ borderColor: '#E5DCC5' }}
                >
                  <td
                    className="px-6 py-4 text-sm font-medium"
                    style={{ color: '#1A1A1A' }}
                  >
                    {u.name || u.full_name || '—'}
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: '#1A1A1A' }}
                  >
                    {u.email || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 border inline-block"
                      style={
                        u.role === 'admin'
                          ? { background: '#D4AF3714', color: '#D4AF37', borderColor: '#D4AF3733' }
                          : { background: '#FAF9F6', color: '#6B6B6B', borderColor: '#E5DCC5' }
                      }
                    >
                      {u.role || 'client'}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: '#6B6B6B' }}
                  >
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
