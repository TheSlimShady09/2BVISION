
import { Navigate } from 'react-router-dom';
import { Auth } from '../pages/Auth';
import { Dashboard } from '../pages/Dashboard';
import { useAuth } from '../context/AuthContext';

export function DashboardSection() {
  const { user } = useAuth();

  // If the logged in user is the admin, redirect them automatically to the Admin Panel
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // If there is no user, render the login form immediately
  if (!user) {
    return (
      <section className="min-h-screen bg-zinc-100 border-t border-zinc-200 pt-24 pb-12">
        <Auth />
      </section>
    );
  }

  // If there is a user, render the dashboard immediately
  return (
    <section className="min-h-screen bg-zinc-100 border-t border-zinc-200 pt-24 pb-12">
      <Dashboard />
    </section>
  );
}
