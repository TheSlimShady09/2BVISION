import { useState } from 'react';
import { Camera, LayoutDashboard, Users, CalendarDays, LogOut } from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminReservations } from './AdminReservations';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
];

export function AdminLayout({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAF9F6' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col border-r"
        style={{ background: '#FAF9F6', borderColor: '#E5DCC5' }}
      >
        {/* Brand */}
        <div className="px-6 py-8 border-b" style={{ borderColor: '#E5DCC5' }}>
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6" style={{ color: '#1A1A1A' }} />
            <div>
              <h1
                className="text-sm font-bold uppercase tracking-[0.2em]"
                style={{ color: '#1A1A1A' }}
              >
                2B Vision
              </h1>
              <p
                className="text-[10px] uppercase tracking-[0.15em] mt-0.5"
                style={{ color: '#6B6B6B' }}
              >
                Administration
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 mb-4"
            style={{ color: '#6B6B6B' }}
          >
            Menu
          </p>
          <ul className="space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? '#1A1A1A' : '#6B6B6B',
                      background: isActive ? '#D4AF3714' : 'transparent',
                      borderLeft: isActive ? '2px solid #D4AF37' : '2px solid transparent',
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isActive ? '#D4AF37' : '#6B6B6B' }}
                    />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign Out */}
        <div className="px-4 py-6 border-t" style={{ borderColor: '#E5DCC5' }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: '#8B0000' }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-10 px-8 py-5 border-b"
          style={{ background: '#FFFFFF', borderColor: '#E5DCC5' }}
        >
          <h2
            className="text-lg font-semibold tracking-wide"
            style={{ color: '#1A1A1A' }}
          >
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
        </header>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'reservations' && <AdminReservations />}
        </div>
      </main>
    </div>
  );
}
