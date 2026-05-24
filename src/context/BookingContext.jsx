import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [globalSelectedPackage, setGlobalSelectedPackage] = useState('');

  useEffect(() => {
    if (user) {
      const storedBookings = localStorage.getItem(`2bvision_bookings_${user.id}`);
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      } else {
        setBookings([]);
      }
    } else {
      setBookings([]);
    }
  }, [user]);

  const addBooking = (bookingData) => {
    if (!user) return { success: false, error: 'User not logged in' };

    const newBooking = {
      ...bookingData,
      id: 'booking_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'Pending Confirmation',
    };

    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem(`2bvision_bookings_${user.id}`, JSON.stringify(updatedBookings));

    return { success: true, booking: newBooking };
  };

  return (
    <BookingContext.Provider value={{ 
      bookings, 
      addBooking, 
      globalSelectedPackage, 
      setGlobalSelectedPackage 
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
