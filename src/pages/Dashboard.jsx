import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CreditCard, LogOut, Settings, User, Download, Loader2, Trash2, AlertTriangle, Mail, Lock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Account settings state
  const [showSettings, setShowSettings] = useState(false);
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const openSettings = () => {
    setFullName(user?.full_name || user?.name || '');
    setNewPassword('');
    setShowSettings(true);
  };

  const handleSaveProfile = async () => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      toast.error(t('dashboard.nameRequired'));
      return;
    }
    setIsSavingProfile(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: trimmed })
        .eq('id', user.id);
      if (profileError) throw profileError;
      // Keep auth metadata in sync so it shows up on next login too.
      await supabase.auth.updateUser({ data: { full_name: trimmed } }).catch(() => {});
      toast.success(t('dashboard.settingsSaved'));
    } catch (err) {
      console.error('[Settings] save profile error:', err);
      toast.error(t('dashboard.settingsError'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error(t('dashboard.passwordTooShort'));
      return;
    }
    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      toast.success(t('dashboard.passwordUpdated'));
    } catch (err) {
      console.error('[Settings] update password error:', err);
      toast.error(err.message || t('dashboard.settingsError'));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await deleteAccount();
    // deleteAccount redirects on success; on failure it shows a toast.
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [bookingsRes, deliverablesRes] = await Promise.all([
          supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('client_deliverables').select('*, bookings(event_type)').eq('client_id', user.id).order('created_at', { ascending: false })
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
              <h1 className="text-3xl font-bold text-[#2d2d2d] mb-1">{t('dashboard.welcome')}, {user?.full_name || user?.name || 'Client'}</h1>
              <p className="text-[#707070]">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 border border-zinc-200 text-[#555555] hover:text-[#2d2d2d] hover:bg-zinc-50 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            {t('dashboard.signOut')}
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
                    {t('dashboard.yourSessions')}
                  </h2>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-50 border border-zinc-200 border-dashed">
                    <p className="text-[#707070] mb-6 font-light">{t('dashboard.noBookings')}</p>
                    <button 
                      onClick={() => navigate('/#booking')}
                      className="inline-block px-8 py-4 bg-[#2d2d2d] text-white font-bold tracking-widest uppercase text-xs hover:bg-[#1e1e1e] transition-colors"
                    >
                      {t('dashboard.bookSession')}
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
                              {booking.package_id === 'essential-story' ? t('pricing.essentialName') : 
                               booking.package_id === 'cinematic-legacy' ? t('pricing.cinematicName') :
                               booking.package_id === 'commercial-vision' ? t('pricing.commercialName') : 
                               booking.package_id || 'Custom Package'}
                            </span>
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              booking.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                              {booking.status === 'Pending' ? t('common.pending') :
                               booking.status === 'Confirmed' ? t('common.confirmed') :
                               booking.status === 'Completed' ? t('common.completed') :
                               booking.status || 'Pending'}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-[#2d2d2d] mb-2">
                            {booking.event_type === 'Portrait' ? t('booking.portrait') :
                             booking.event_type === 'Wedding' ? t('booking.wedding') :
                             booking.event_type === 'Commercial' ? t('booking.commercial') :
                             booking.event_type === 'Other' ? t('booking.other') :
                             booking.event_type || 'Photography Session'}
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
                            {t('dashboard.viewDetails')}
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
                    <Download className="w-4 h-4" /> {t('dashboard.yourMedia')}
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
                            <span className="text-sm font-medium text-[#2d2d2d]">
                              {del.bookings?.event_type === 'Portrait' ? t('booking.portrait') :
                               del.bookings?.event_type === 'Wedding' ? t('booking.wedding') :
                               del.bookings?.event_type === 'Commercial' ? t('booking.commercial') :
                               del.bookings?.event_type || 'Session Files'}
                            </span>
                          </div>
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-[#2d2d2d] transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-8 border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">{t('dashboard.quickActions')}</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/#pricing')}
                    className="flex items-center gap-3 w-full p-4 bg-zinc-50 border border-zinc-200 hover:border-slate-300 transition-colors text-[#555555] hover:text-[#2d2d2d] group"
                  >
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">{t('dashboard.viewPricing')}</span>
                  </button>
                  <button
                    onClick={openSettings}
                    className="flex items-center gap-3 w-full p-4 bg-zinc-50 border border-zinc-200 hover:border-slate-300 transition-colors text-[#555555] hover:text-[#2d2d2d] group"
                  >
                    <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">{t('dashboard.accountSettings')}</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-[#1e1e1e] p-8 text-white shadow-xl relative overflow-hidden border border-[#444444]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10"></div>
                <h3 className="text-lg font-bold mb-3">{t('dashboard.needHelp')}</h3>
                <p className="text-[#a0a0a0] text-sm mb-8 font-light leading-relaxed">
                  {t('dashboard.helpDesc')}
                </p>
                <a
                  href="mailto:hello@2bvision.com"
                  className="inline-block px-6 py-3 bg-white text-[#2d2d2d] text-xs font-bold tracking-widest uppercase hover:bg-[#e8e8e8] transition-colors"
                >
                  {t('dashboard.contactSupport')}
                </a>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Account Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-lg w-full my-auto border border-zinc-200 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-200">
                <h3 className="text-xl font-bold text-[#2d2d2d] flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-400" />
                  {t('dashboard.accountSettings')}
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-[#2d2d2d] transition-colors"
                  aria-label={t('dashboard.cancel')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Profile Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('dashboard.profileSection')}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">{t('dashboard.fullNameLabel')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('dashboard.fullNameLabel')}
                          className="block w-full pl-10 pr-3 py-3 border border-zinc-200 bg-transparent text-[#2d2d2d] focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">{t('dashboard.emailLabel')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          disabled
                          className="block w-full pl-10 pr-3 py-3 border border-zinc-200 bg-zinc-50 text-[#707070] text-sm cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5">{t('dashboard.emailReadonly')}</p>
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2d2d2d] text-white hover:bg-[#1e1e1e] transition-colors uppercase tracking-widest text-xs font-bold disabled:opacity-70"
                    >
                      {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.saveChanges')}
                    </button>
                  </div>
                </div>

                {/* Security Section */}
                <div className="pt-2 border-t border-zinc-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pt-6">{t('dashboard.securitySection')}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">{t('dashboard.newPasswordLabel')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('dashboard.newPasswordPlaceholder')}
                          className="block w-full pl-10 pr-3 py-3 border border-zinc-200 bg-transparent text-[#2d2d2d] focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleUpdatePassword}
                      disabled={isSavingPassword || !newPassword}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-zinc-200 text-[#555555] hover:bg-zinc-50 transition-colors uppercase tracking-widest text-xs font-bold disabled:opacity-50"
                    >
                      {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.updatePassword')}
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-2 border-t border-red-100">
                  <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3 pt-6 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {t('dashboard.dangerZone')}
                  </h4>
                  <p className="text-[#707070] text-sm mb-4 font-light leading-relaxed">
                    {t('dashboard.deleteAccountDesc')}
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 w-full justify-center px-6 py-3 border border-red-300 text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('dashboard.deleteAccount')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-md w-full p-8 border border-zinc-200 shadow-2xl"
            >
              <div className="w-14 h-14 bg-red-50 border border-red-200 flex items-center justify-center mb-6">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#2d2d2d] mb-3">{t('dashboard.deleteConfirmTitle')}</h3>
              <p className="text-[#707070] text-sm mb-8 font-light leading-relaxed">
                {t('dashboard.deleteConfirmDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 border border-zinc-200 text-[#555555] hover:bg-zinc-50 transition-colors uppercase tracking-widest text-xs font-bold disabled:opacity-50"
                >
                  {t('dashboard.cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors uppercase tracking-widest text-xs font-bold disabled:opacity-70"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('dashboard.deleteConfirmButton')
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
