import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from './api';
import DashboardPage from './pages/DashboardPage';
import UnitsPage from './pages/UnitsPage';
import UnitDetailPage from './pages/UnitDetailPage';
import Toast from './components/Toast';
import './App.css';

export const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [toast, setToast] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    try {
      const d = await api.dashboard();
      setDashboard(d);
    } catch (err) {
      showToast(err.message, true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const ctx = { dashboard, refresh, showToast, navigate };

  return (
    <AppContext.Provider value={ctx}>
      <div className="layout">
        {/* Mobile header */}
        <header className="mobile-header">
          <button className="hamburger" onClick={() => setNavOpen(!navOpen)}>
            <span /><span /><span />
          </button>
          <span className="mobile-logo">MarsMobile</span>
        </header>

        {/* Sidebar */}
        <nav className={`sidebar${navOpen ? ' open' : ''}`}>
          <div className="sidebar-brand">
            <div className="brand-icon">M</div>
            <div>
              <div className="brand-name">MarsMobile</div>
              <div className="brand-sub">Logistics Tracker</div>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Menu</div>
            <NavLink to="/" end className="nav-item" onClick={() => setNavOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </NavLink>
            <NavLink to="/units" className="nav-item" onClick={() => setNavOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              Units
              {dashboard && <span className="nav-badge">{dashboard.total}</span>}
            </NavLink>
          </div>

          <div className="nav-section">
            <div className="nav-label">Locations</div>
            {dashboard && [
              { key: 'DISPATCHED_USA', label: 'USA Outbound', dot: 'dot-usa' },
              { key: 'ARRIVED_BOG', label: 'Bogota', dot: 'dot-bog' },
              { key: 'DISPATCHED_BOG', label: 'In Transit', dot: 'dot-transit' },
              { key: 'RESERVED_IN_TRANSIT', label: 'Reserved', dot: 'dot-reserved' },
              { key: 'ARRIVED_DXB', label: 'Dubai', dot: 'dot-dubai' },
              { key: 'ARRIVED_DXB_SOLD', label: 'Sold', dot: 'dot-sold' },
            ].map((loc) => (
              <NavLink
                key={loc.key}
                to={`/units?state=${loc.key}`}
                className="nav-item nav-item-location"
                onClick={() => setNavOpen(false)}
              >
                <span className={`nav-dot ${loc.dot}`} />
                {loc.label}
                <span className="nav-count">{dashboard.counts[loc.key]}</span>
              </NavLink>
            ))}
          </div>

          <div className="sidebar-footer">
            <button className="btn btn-ghost btn-sm" onClick={async () => {
              if (!window.confirm('Clear all data?')) return;
              await api.reset();
              refresh();
              showToast('All data cleared');
              navigate('/');
            }}>
              Reset Demo
            </button>
          </div>
        </nav>

        {/* Overlay for mobile nav */}
        {navOpen && <div className="nav-overlay" onClick={() => setNavOpen(false)} />}

        {/* Main content */}
        <main className="main">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/units/:id" element={<UnitDetailPage />} />
          </Routes>
        </main>
      </div>

      {toast && <Toast message={toast.msg} isError={toast.isError} />}
    </AppContext.Provider>
  );
}
