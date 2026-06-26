import { useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#fff', minHeight: '100vh' }}>
          <h2 style={{ color: 'red' }}>App Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{this.state.error?.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#999', fontSize: 12 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { ProjectDetail } from './pages/ProjectDetail';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
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

// ── Public Layout (Navbar + Footer) ──────────────────────────────────────────
function PublicLayout() {
  const { user } = useAuth();

  // Redirect admin to the Admin Panel if they are anywhere on the public layout
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <CursorProvider>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/dashboard" element={<DashboardSection />} />
            <Route path="/client-portal" element={<DashboardSection />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </CursorProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <Toaster position="bottom-center" toastOptions={{ className: 'rounded-none border border-zinc-200 text-sm tracking-wider font-medium' }} />
            <Routes>
              {/* Admin — completely isolated, no Navbar/Footer/Cursor */}
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Everything else — wrapped in public layout */}
              <Route path="/*" element={<PublicLayout />} />
            </Routes>
          </BookingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
