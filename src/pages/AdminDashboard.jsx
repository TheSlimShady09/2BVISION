import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Loader2, Search, Calendar, Clock, Phone, Mail, MoreVertical, CheckCircle, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { user, isLoading: authIsLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Independent role verification ─────────────────────────────────────────
  // We do NOT rely on AuthContext's user.role, because resolveUser() may
  // silently fall back to 'client' when the profiles fetch fails or races.
  // Instead, we fetch the role ourselves and gate access on that.
  const [verifiedRole, setVerifiedRole] = useState(null);   // null = not yet fetched
  const [roleLoading, setRoleLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    // Wait until AuthContext finishes loading and we have a user
    if (authIsLoading || !user) {
      setRoleLoading(false);   // nothing to fetch — let the guard render
      return;
    }

    let cancelled = false;

    const fetchRole = async () => {
      setRoleLoading(true);
      setFetchError(null);

      console.log('Current User ID:', user.id);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log('Fetched Profile:', data, 'Error:', error);

        if (cancelled) return;

        if (error) {
          console.error('Role fetch error — defaulting to non-admin:', error.message);
          setFetchError(error.message);
          setVerifiedRole('client');
        } else {
          setVerifiedRole(data?.role ?? 'client');
        }
      } catch (err) {
        console.error('Role fetch exception:', err);
        if (!cancelled) {
          setFetchError(err.message || String(err));
          setVerifiedRole('client');
        }
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    };

    fetchRole();

    return () => { cancelled = true; };
  }, [user?.id, authIsLoading]);   // only re-run when the user ID actually changes

  // ── Fetch bookings once role is confirmed admin ───────────────────────────
  useEffect(() => {
    if (verifiedRole === 'admin') {
      fetchBookings();
    }
  }, [verifiedRole]);

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setBookings(prev => 
        prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
      );
      toast.success(`Booking marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status', error);
      toast.error('Failed to update status');
    }
  };

  // ── Loading state — while auth OR role fetch is in progress ───────────────
  if (authIsLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300 mb-6" />
        <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Verifying Credentials...</p>
      </div>
    );
  }

  // ── Access Denied — only shown AFTER the role fetch is complete ────────────
  if (!user || verifiedRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-[#2d3748] p-6">
        <h1 className="text-2xl font-[400] tracking-widest mb-6 uppercase">Access Denied</h1>
        <div className="text-sm border border-gray-200 p-6 bg-white shadow-sm w-full max-w-md text-left font-mono">
          <p className="mb-2"><strong>User ID:</strong> {user?.id || 'User not detected'}</p>
          <p className="mb-2"><strong>Fetched Role:</strong> {verifiedRole || 'No role fetched'}</p>
          <p className="mb-2"><strong>Supabase Error:</strong> {fetchError || 'None'}</p>
        </div>
        <a href="/" className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 hover:text-zinc-900 transition-colors border-b border-transparent hover:border-zinc-900 pb-1">
          Return to Home
        </a>
      </div>
    );
  }

  const filteredBookings = bookings.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-zinc-200">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-zinc-900"></div>
            <div>
              <h1 className="text-xl font-medium text-zinc-900 tracking-wide">Command Center</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">2B Vision Administration</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-500">Active Bookings ({bookings.length})</h2>
        </div>

        {isLoadingBookings ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredBookings.map((booking) => (
                <motion.div 
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group bg-white border border-zinc-200 p-0 flex flex-col sm:flex-row hover:border-zinc-300 transition-colors"
                >
                  {/* Status Indicator Bar */}
                  <div className={`w-full sm:w-1.5 h-1.5 sm:h-auto ${
                    booking.status === 'Completed' ? 'bg-zinc-800' :
                    booking.status === 'Confirmed' ? 'bg-zinc-400' :
                    'bg-zinc-200'
                  }`} />
                  
                  <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-zinc-900 tracking-wide mb-1">{booking.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 bg-zinc-50 px-2 py-1 border border-zinc-200 inline-block">
                            {booking.package_id || booking.event_type}
                          </span>
                        </div>
                        
                        {/* Status Dropdown / Actions */}
                        <div className="relative group/dropdown">
                          <button className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 text-xs font-semibold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                            {booking.status} <MoreVertical className="w-3 h-3" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-zinc-200 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-20">
                            {['Pending', 'Confirmed', 'Completed'].map(status => (
                              <button
                                key={status}
                                onClick={() => updateStatus(booking.id, status)}
                                disabled={booking.status === status}
                                className={`w-full text-left px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors ${
                                  booking.status === status 
                                    ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed' 
                                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                                }`}
                              >
                                Mark {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-6">
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                          <Mail className="w-4 h-4 text-zinc-400" />
                          <a href={`mailto:${booking.email}`} className="hover:text-zinc-900 truncate">{booking.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                          <Phone className="w-4 h-4 text-zinc-400" />
                          <span>{booking.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                          <Calendar className="w-4 h-4 text-zinc-400" />
                          <span>{booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                          <Clock3 className="w-4 h-4 text-zinc-400" />
                          <span>{booking.time || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div className="mt-6 pt-4 border-t border-zinc-100">
                        <p className="text-xs text-zinc-500 font-light leading-relaxed line-clamp-2">
                          <span className="font-semibold uppercase tracking-wider mr-2">Notes:</span> 
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredBookings.length === 0 && !isLoadingBookings && (
              <div className="col-span-full py-20 text-center border border-zinc-200 border-dashed bg-white">
                <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium">No bookings found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
