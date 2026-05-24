import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Calendar, Image as ImageIcon, MessageSquare, Download, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Data states
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Forms states
  const [portfolioForm, setPortfolioForm] = useState({ title: '', type: 'Photography', url: '', category: '' });
  const [deliverableForm, setDeliverableForm] = useState({ booking_id: '', user_id: '', url: '', type: 'Gallery' });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, messagesRes, deliverablesRes] = await Promise.all([
        supabase.from('bookings').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('client_deliverables').select('*, bookings(event_type, date)').order('created_at', { ascending: false })
      ]);
      
      if (bookingsRes.error) throw bookingsRes.error;
      if (messagesRes.error) throw messagesRes.error;
      if (deliverablesRes.error) throw deliverablesRes.error;

      setBookings(bookingsRes.data || []);
      setMessages(messagesRes.data || []);
      setDeliverables(deliverablesRes.data || []);
    } catch (error) {
      toast.error('Error fetching admin data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Booking status updated to ${status}`);
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('portfolio').insert([portfolioForm]);
      if (error) throw error;
      toast.success('Portfolio item added!');
      setPortfolioForm({ title: '', type: 'Photography', url: '', category: '' });
    } catch (error) {
      toast.error('Failed to add portfolio item');
    }
  };

  const handleDeliverableSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('client_deliverables').insert([deliverableForm]);
      if (error) throw error;
      toast.success('Deliverable assigned!');
      setDeliverableForm({ booking_id: '', user_id: '', url: '', type: 'Gallery' });
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to assign deliverable');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-zinc-50">
        <div className="text-slate-500 font-light text-lg">Unauthorized Access</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen py-12 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 border border-zinc-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1 uppercase tracking-widest">Admin Control</h1>
            <p className="text-slate-500 font-light">Manage studio operations and content.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-zinc-200 gap-8">
          {[
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'portfolio', label: 'Portfolio CMS', icon: ImageIcon },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'deliverables', label: 'Deliverables', icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab.id ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 shadow-sm p-8"
          >
            
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Booking Management</h2>
                {bookings.length === 0 ? <p className="text-slate-500">No bookings found.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 text-xs uppercase tracking-widest text-slate-500">
                          <th className="pb-4 pr-4">Client</th>
                          <th className="pb-4 pr-4">Event</th>
                          <th className="pb-4 pr-4">Date & Time</th>
                          <th className="pb-4 pr-4">Package</th>
                          <th className="pb-4">Status / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {bookings.map(booking => (
                          <tr key={booking.id} className="text-sm text-slate-700">
                            <td className="py-4 pr-4 font-medium text-slate-900">
                              {booking.profiles?.full_name || booking.name}<br/>
                              <span className="text-xs text-slate-400 font-normal">{booking.profiles?.email || booking.email}</span>
                            </td>
                            <td className="py-4 pr-4">{booking.event_type}</td>
                            <td className="py-4 pr-4">{new Date(booking.date).toLocaleDateString()} at {booking.time}</td>
                            <td className="py-4 pr-4"><span className="bg-slate-100 px-2 py-1 text-xs font-bold uppercase">{booking.package_id}</span></td>
                            <td className="py-4">
                              <select 
                                value={booking.status} 
                                onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                                className={`text-xs font-bold uppercase border px-2 py-1 outline-none ${
                                  booking.status === 'Completed' ? 'border-green-300 text-green-700 bg-green-50' :
                                  booking.status === 'Confirmed' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                                  'border-yellow-300 text-yellow-700 bg-yellow-50'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Portfolio Item</h2>
                <form onSubmit={handlePortfolioSubmit} className="max-w-xl space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Title</label>
                    <input required type="text" value={portfolioForm.title} onChange={e => setPortfolioForm({...portfolioForm, title: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 text-slate-900 outline-none focus:border-slate-800" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Type</label>
                      <select value={portfolioForm.type} onChange={e => setPortfolioForm({...portfolioForm, type: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 text-slate-900 outline-none focus:border-slate-800">
                        <option value="Photography">Photography</option>
                        <option value="Videography">Videography</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category (e.g. Wedding)</label>
                      <input required type="text" value={portfolioForm.category} onChange={e => setPortfolioForm({...portfolioForm, category: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 text-slate-900 outline-none focus:border-slate-800" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Media URL</label>
                    <input required type="url" value={portfolioForm.url} onChange={e => setPortfolioForm({...portfolioForm, url: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 text-slate-900 outline-none focus:border-slate-800" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-slate-800 text-white font-bold tracking-widest uppercase text-sm hover:bg-slate-900 transition-all mt-4">
                    Add to Portfolio
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Messages</h2>
                {messages.length === 0 ? <p className="text-slate-500">No messages found.</p> : (
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div key={msg.id} className="border border-zinc-200 p-6 bg-zinc-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-900">{msg.name}</h4>
                            <p className="text-sm text-slate-500">{msg.email}</p>
                          </div>
                          <span className="text-xs text-slate-400 font-bold uppercase">{new Date(msg.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 font-light leading-relaxed">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deliverables' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Assign Deliverable</h2>
                  <form onSubmit={handleDeliverableSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Booking</label>
                      <select required value={deliverableForm.booking_id} onChange={e => {
                        const b = bookings.find(x => x.id === e.target.value);
                        setDeliverableForm({...deliverableForm, booking_id: b.id, user_id: b.user_id});
                      }} className="w-full bg-zinc-50 border border-zinc-200 p-3 text-slate-900 outline-none focus:border-slate-800">
                        <option value="">-- Choose Booking --</option>
                        {bookings.filter(b => b.status === 'Completed').map(b => (
                          <option key={b.id} value={b.id}>{b.profiles?.full_name || b.name} - {b.event_type} ({new Date(b.date).toLocaleDateString()})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Type</label>
                      <select value={deliverableForm.type} onChange={e => setDeliverableForm({...deliverableForm, type: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 text-slate-900 outline-none focus:border-slate-800">
                        <option value="Gallery">Photo Gallery</option>
                        <option value="Video">Video Link</option>
                        <option value="Zip">ZIP Download</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Deliverable URL</label>
                      <input required type="url" value={deliverableForm.url} onChange={e => setDeliverableForm({...deliverableForm, url: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 text-slate-900 outline-none focus:border-slate-800" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-800 text-white font-bold tracking-widest uppercase text-sm hover:bg-slate-900 transition-all mt-4">
                      Assign to Client
                    </button>
                  </form>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Deliverables</h2>
                  <div className="space-y-4">
                    {deliverables.map(del => (
                      <div key={del.id} className="border border-zinc-200 p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-600">{del.type}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{del.bookings?.event_type}</p>
                        </div>
                        <a href={del.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                          <CheckCircle className="w-5 h-5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </div>
    </div>
  );
}
