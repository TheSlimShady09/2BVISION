import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { CursorProvider } from './context/CursorContext';

import { FloatingWhatsApp } from './components/ui/FloatingWhatsApp';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { Hero } from './pages/Hero';
import { Story } from './pages/Story';
import { Stats } from './pages/Stats';
import { Portfolio } from './pages/Portfolio';
import { Testimonials } from './pages/Testimonials';
import { FAQ } from './pages/FAQ';
import { Pricing } from './pages/Pricing';
import { Booking } from './pages/Booking';
import { AdminDashboard } from './pages/AdminDashboard';
import { DashboardSection } from './components/DashboardSection';

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    if (pathname === '/dashboard') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function MainPage() {
  return (
    <>
      <Hero />
      <Story />
      <Stats />
      <Portfolio />
      <Testimonials />
      <FAQ />
      <Pricing />
      <Booking />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <CursorProvider>
            <ScrollToTop />
            <Toaster position="bottom-center" toastOptions={{ className: 'rounded-none border border-slate-200 text-sm tracking-wider font-medium' }} />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/dashboard" element={<DashboardSection />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Footer />
              <FloatingWhatsApp />
            </div>
          </CursorProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
