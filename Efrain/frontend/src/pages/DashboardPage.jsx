import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { api } from '../api';
import CreateModal from '../components/CreateModal';
import './DashboardPage.css';

const PIPELINE = [
  { key: 'DISPATCHED_USA', label: 'USA', sublabel: 'Outbound', icon: '🇺🇸', dot: 'dot-usa', color: 'var(--accent)' },
  { key: 'ARRIVED_BOG', label: 'Bogota', sublabel: 'Warehouse', icon: '🇨🇴', dot: 'dot-bog', color: 'var(--green)' },
  { key: 'DISPATCHED_BOG', label: 'In Transit', sublabel: 'BOG → DXB', icon: '✈️', dot: 'dot-transit', color: 'var(--orange)' },
  { key: 'RESERVED_IN_TRANSIT', label: 'Reserved', sublabel: 'In Transit', icon: '🔒', dot: 'dot-reserved', color: 'var(--purple)' },
  { key: 'ARRIVED_DXB', label: 'Dubai', sublabel: 'Warehouse', icon: '🇦🇪', dot: 'dot-dubai', color: 'var(--indigo)' },
  { key: 'ARRIVED_DXB_SOLD', label: 'Sold', sublabel: 'Complete', icon: '✅', dot: 'dot-sold', color: 'var(--green)' },
];

function AnimatedNumber({ value, delay = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value === 0) { setDisplay(0); return; }
      const duration = 600;
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return <span>{display}</span>;
}

export default function DashboardPage() {
  const { dashboard, refresh, showToast } = useApp();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [recentUnits, setRecentUnits] = useState([]);

  useEffect(() => {
    api.units().then((units) => setRecentUnits(units.slice(0, 8))).catch(() => {});
  }, [dashboard]);

  const handleCreate = async (count, prefix) => {
    try {
      const result = await api.createUnits(count, prefix);
      setShowCreate(false);
      showToast(`${result.created} unit${result.created !== 1 ? 's' : ''} dispatched from USA`);
      refresh();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  if (!dashboard) return null;

  const counts = dashboard.counts;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your global logistics pipeline</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Dispatch from USA
          </button>
        </div>
      </div>

      {/* Pipeline flow visualization */}
      <div className="pipeline-section" style={{ animationDelay: '0.1s' }}>
        <div className="pipeline">
          {PIPELINE.map((stage, i) => (
            <div key={stage.key} className="pipeline-stage" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
              {i > 0 && (
                <div className="pipeline-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div
                className={`pipeline-card ${counts[stage.key] > 0 ? 'has-units' : ''}`}
                onClick={() => navigate(`/units?state=${stage.key}`)}
                style={{ '--stage-color': stage.color }}
              >
                <div className="pipeline-icon">{stage.icon}</div>
                <div className="pipeline-count" style={{ color: stage.color }}>
                  <AnimatedNumber value={counts[stage.key]} delay={200 + i * 100} />
                </div>
                <div className="pipeline-label">{stage.label}</div>
                <div className="pipeline-sublabel">{stage.sublabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="summary-row">
        <div className="summary-card card" style={{ animationDelay: '0.3s' }}>
          <div className="summary-value" style={{ color: 'var(--accent)' }}>
            <AnimatedNumber value={dashboard.total} delay={300} />
          </div>
          <div className="summary-label">Total Units</div>
        </div>
        <div className="summary-card card" style={{ animationDelay: '0.4s' }}>
          <div className="summary-value" style={{ color: 'var(--orange)' }}>
            <AnimatedNumber value={counts.DISPATCHED_BOG + counts.RESERVED_IN_TRANSIT} delay={400} />
          </div>
          <div className="summary-label">In Transit</div>
        </div>
        <div className="summary-card card" style={{ animationDelay: '0.5s' }}>
          <div className="summary-value" style={{ color: 'var(--green)' }}>
            <AnimatedNumber value={counts.ARRIVED_DXB_SOLD} delay={500} />
          </div>
          <div className="summary-label">Sold</div>
        </div>
        <div className="summary-card card" style={{ animationDelay: '0.6s' }}>
          <div className="summary-value" style={{ color: 'var(--purple)' }}>
            <AnimatedNumber value={counts.RESERVED_IN_TRANSIT} delay={600} />
          </div>
          <div className="summary-label">Reserved</div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="recent-section" style={{ animationDelay: '0.5s' }}>
        <div className="section-header">
          <h2>Recent Units</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/units')}>View all</button>
        </div>
        <div className="recent-grid">
          {recentUnits.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>No units yet. Dispatch your first batch from USA.</p>
            </div>
          )}
          {recentUnits.map((unit, i) => (
            <div
              key={unit.id}
              className="recent-card card"
              onClick={() => navigate(`/units/${unit.id}`)}
              style={{ animationDelay: `${0.5 + i * 0.05}s` }}
            >
              <div className="recent-sku">{unit.sku}</div>
              <span className={`state-badge state-${unit.current_state}`}>
                {dashboard.labels[unit.current_state]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
