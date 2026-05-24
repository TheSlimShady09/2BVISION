import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useCursor } from '../context/CursorContext';
import { supabase } from '../lib/supabase';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
];

export function Booking() {
  const { user } = useAuth();
  const { globalSelectedPackage } = useBooking();
  const { setHovering, setDefault } = useCursor();
  const navigate = useNavigate();
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    eventType: 'Portrait',
    packageId: globalSelectedPackage || '',
    notes: ''
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, packageId: globalSelectedPackage }));
  }, [globalSelectedPackage]);

  const [isSuccess, setIsSuccess] = useState(false);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/dashboard');
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time");
      return;
    }

    if (!captchaToken) {
      toast.error('Të lutem konfirmo që nuk je robot (CAPTCHA).');
      return;
    }

    try {
      const { error } = await supabase.from('bookings').insert([{
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        event_type: formData.eventType,
        package_id: formData.packageId,
        notes: formData.notes,
        date: selectedDate.toISOString(),
        time: selectedTime,
        status: 'Pending'
      }]);

      if (error) throw error;

      setIsSuccess(true);
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ ...formData, notes: '' });
        setSelectedDate(null);
        setSelectedTime(null);
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error submitting booking', error);
      alert('Failed to submit booking. Please try again.');
    }
  };

  return (
    <section id="booking" className="min-h-screen bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-200">
      <div className="max-w-5xl mx-auto">
        
        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-50 p-12 border border-zinc-200 text-center w-full my-32"
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Booking Confirmed!</h2>
            <p className="text-slate-500 mb-8">
              Your session has been successfully booked. Please check your Client Portal.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-slate-900 mb-4"
              >
                Book a Session
              </motion.h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-light">
                Select your preferred date and time to reserve your cinematic experience.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Calendar Section */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-zinc-50 p-8 border border-zinc-200"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                    Select Date
                  </h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={handlePrevMonth} 
                      type="button" 
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                      onMouseEnter={setHovering}
                      onMouseLeave={setDefault}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-slate-900 font-medium min-w-[120px] text-center">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button 
                      onClick={handleNextMonth} 
                      type="button" 
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                      onMouseEnter={setHovering}
                      onMouseLeave={setDefault}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-slate-400 text-xs font-bold uppercase">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map((day, i) => {
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                      <button
                        key={day.toString()}
                        type="button"
                        onClick={() => !isPast && setSelectedDate(day)}
                        onMouseEnter={(!isPast && isCurrentMonth) ? setHovering : undefined}
                        onMouseLeave={setDefault}
                        disabled={isPast || !isCurrentMonth}
                        className={`aspect-square flex items-center justify-center text-sm font-medium transition-all
                          ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                          ${isPast ? 'text-zinc-300' : 'hover:bg-zinc-200 text-slate-700'}
                          ${isSelected ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-md' : ''}
                          ${isToday(day) && !isSelected ? 'border border-slate-300 text-slate-900' : ''}
                        `}
                      >
                        {isCurrentMonth ? format(day, 'd') : ''}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {selectedDate && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 overflow-hidden"
                    >
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Available Times
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            onMouseEnter={setHovering}
                            onMouseLeave={setDefault}
                            className={`py-3 text-sm font-medium transition-all border ${
                              selectedTime === time 
                                ? 'bg-slate-800 text-white border-slate-800' 
                                : 'bg-white text-slate-600 border-zinc-200 hover:border-slate-400 hover:text-slate-900'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Form Section */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-zinc-50 p-8 border border-zinc-200"
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Details</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white border border-zinc-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white border border-zinc-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white border border-zinc-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Event Type</label>
                        <select
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleChange}
                          className="w-full bg-white border border-zinc-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all appearance-none"
                        >
                          <option value="Portrait">Portrait</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Package</label>
                        <select
                          name="packageId"
                          value={formData.packageId}
                          onChange={handleChange}
                          className="w-full bg-white border border-zinc-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all appearance-none"
                        >
                          <option value="">Select Package</option>
                          <option value="essential-story">Essential Story</option>
                          <option value="cinematic-legacy">Cinematic Legacy</option>
                          <option value="commercial-vision">Commercial Vision</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Additional Notes</label>
                      <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full bg-white border border-zinc-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {!user && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 text-sm mt-4">
                      You will be asked to sign in or create an account via the Client Portal to confirm your booking.
                    </div>
                  )}

                  {/* reCAPTCHA widget */}
                  <div className="flex justify-center pt-2">
                    <div className="border border-zinc-200 p-2 bg-white">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                        onChange={setCaptchaToken}
                        onExpired={() => setCaptchaToken(null)}
                        theme="light"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime}
                    onMouseEnter={(!selectedDate || !selectedTime) ? undefined : setHovering}
                    onMouseLeave={setDefault}
                    className="w-full py-4 bg-slate-800 text-white font-bold tracking-widest uppercase text-sm hover:bg-slate-900 transition-all disabled:opacity-50 disabled:bg-slate-400 mt-8"
                  >
                    Confirm Booking
                  </button>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
