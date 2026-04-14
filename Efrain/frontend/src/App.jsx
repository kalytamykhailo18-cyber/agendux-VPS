import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from './api';
import DashboardPage from './pages/DashboardPage';
import UnitsPage from './pages/UnitsPage';
import UnitDetailPage from './pages/UnitDetailPage';
import Toast from './components/Toast';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import Inventory2Icon from '@mui/icons-material/Inventory2Rounded';
import MenuIcon from '@mui/icons-material/MenuRounded';
import RestartAltIcon from '@mui/icons-material/RestartAltRounded';
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
            <MenuIcon fontSize="small" />
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
              <DashboardIcon fontSize="small" />
              Dashboard
            </NavLink>
            <NavLink to="/units" className="nav-item" onClick={() => setNavOpen(false)}>
              <Inventory2Icon fontSize="small" />
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
              <RestartAltIcon fontSize="small" />
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
