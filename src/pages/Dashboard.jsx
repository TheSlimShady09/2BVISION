import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, CreditCard, LogOut, Settings, User, Download, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [bookingsRes, deliverablesRes] = await Promise.all([
          supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('client_deliverables').select('*, bookings(event_type)').eq('user_id', user.id).order('created_at', { ascending: false })
        ]);

        setBookings(bookingsRes.data || []);
        setDeliverables(deliverablesRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
            <div className="w-20 h-20 bg-zinc-50 flex items-center justify-center border border-zinc-200">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2d2d2d] mb-1">Welcome back, {user?.full_name || user?.name || 'Client'}</h1>
              <p className="text-[#707070]">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 border border-zinc-200 text-[#555555] hover:text-[#2d2d2d] hover:bg-zinc-50 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24 bg-white border border-zinc-200">
            <Loader2 className="w-10 h-10 animate-spin text-[#c8c8c8]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - Bookings */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-[#2d2d2d] flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-slate-400" />
                    Your Sessions
                  </h2>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-50 border border-zinc-200 border-dashed">
                    <p className="text-[#707070] mb-6 font-light">You have no active bookings.</p>
                    <button 
                      onClick={() => navigate('/#booking')}
                      className="inline-block px-8 py-4 bg-[#2d2d2d] text-white font-bold tracking-widest uppercase text-xs hover:bg-[#1e1e1e] transition-colors"
                    >
                      Book a Session
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <motion.div 
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-zinc-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-zinc-100 text-[#444444] text-xs font-bold uppercase tracking-wider">
                              {booking.package_id || 'Custom Package'}
                            </span>
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              booking.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                              {booking.status || 'Pending'}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-[#2d2d2d] mb-2">
                            {booking.event_type || 'Photography Session'}
                          </h3>
                          <div className="flex items-center gap-6 text-sm text-[#707070] font-light">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : '—'}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {booking.time}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-200">
                          <button 
                            className="text-xs font-bold uppercase tracking-widest text-[#707070] hover:text-[#2d2d2d] transition-colors border-b border-transparent hover:border-[#1e1e1e] pb-1"
                          >
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Quick Actions & Deliverables */}
            <div className="space-y-8">
              {deliverables.length > 0 && (
                <div className="bg-white p-8 border border-zinc-200 shadow-sm">
                  <h3 className="text-sm font-bold text-[#2d2d2d] mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Download className="w-4 h-4" /> Your Media
                  </h3>
                  <div className="space-y-4">
                    {deliverables.map(del => (
                      <a 
                        key={del.id}
                        href={del.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-4 border border-zinc-200 hover:border-[#2d2d2d] transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-bold text-[#707070] uppercase tracking-widest block mb-1">{del.type}</span>
                            <span className="text-sm font-medium text-[#2d2d2d]">{del.bookings?.event_type || 'Session Files'}</span>
                          </div>
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-[#2d2d2d] transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-8 border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/#pricing')}
                    className="flex items-center gap-3 w-full p-4 bg-zinc-50 border border-zinc-200 hover:border-slate-300 transition-colors text-[#555555] hover:text-[#2d2d2d] group"
                  >
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">View Pricing</span>
                  </button>
                  <button 
                    className="flex items-center gap-3 w-full p-4 bg-zinc-50 border border-zinc-200 hover:border-slate-300 transition-colors text-[#555555] hover:text-[#2d2d2d] group"
                  >
                    <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Account Settings</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-[#1e1e1e] p-8 text-white shadow-xl relative overflow-hidden border border-[#444444]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10"></div>
                <h3 className="text-lg font-bold mb-3">Need Help?</h3>
                <p className="text-[#a0a0a0] text-sm mb-8 font-light leading-relaxed">
                  Contact your dedicated producer for questions about your upcoming sessions.
                </p>
                <a 
                  href="mailto:hello@2bvision.com" 
                  className="inline-block px-6 py-3 bg-white text-[#2d2d2d] text-xs font-bold tracking-widest uppercase hover:bg-[#e8e8e8] transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
