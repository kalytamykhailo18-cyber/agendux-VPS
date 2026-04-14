import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { api } from '../api';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import FlightRoundedIcon from '@mui/icons-material/FlightRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import './UnitDetailPage.css';

const VALID_TRANSITIONS = {
  DISPATCHED_USA: ['ARRIVED_BOG'],
  ARRIVED_BOG: ['DISPATCHED_BOG'],
  DISPATCHED_BOG: ['RESERVED_IN_TRANSIT', 'ARRIVED_DXB'],
  RESERVED_IN_TRANSIT: ['ARRIVED_DXB_SOLD'],
  ARRIVED_DXB: [],
  ARRIVED_DXB_SOLD: [],
};

const ACTION_CONFIG = {
  ARRIVED_BOG: { label: 'Mark Arrived in Bogota', cls: 'btn-green' },
  DISPATCHED_BOG: { label: 'Dispatch to Dubai', cls: 'btn-orange' },
  RESERVED_IN_TRANSIT: { label: 'Reserve for Sale', cls: 'btn-purple' },
  ARRIVED_DXB: { label: 'Confirm Arrival Dubai', cls: 'btn-indigo' },
  ARRIVED_DXB_SOLD: { label: 'Confirm Arrived & Sold', cls: 'btn-indigo' },
};

const STAGE_ORDER = [
  'DISPATCHED_USA',
  'ARRIVED_BOG',
  'DISPATCHED_BOG',
  'RESERVED_IN_TRANSIT',
  'ARRIVED_DXB',
  'ARRIVED_DXB_SOLD',
];

const STAGE_ICONS = {
  DISPATCHED_USA: LocalShippingRoundedIcon,
  ARRIVED_BOG: WarehouseRoundedIcon,
  DISPATCHED_BOG: FlightRoundedIcon,
  RESERVED_IN_TRANSIT: BookmarkRoundedIcon,
  ARRIVED_DXB: StorefrontRoundedIcon,
  ARRIVED_DXB_SOLD: CheckCircleRoundedIcon,
};

function formatTime(ts) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatDuration(from, to) {
  const ms = new Date(to) - new Date(from);
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

function StageIcon({ state, ...props }) {
  const Icon = STAGE_ICONS[state];
  return Icon ? <Icon {...props} /> : null;
}

export default function UnitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dashboard, refresh, showToast } = useApp();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUnit = async () => {
    try {
      const u = await api.unit(id);
      setUnit(u);
      setLoading(false);
    } catch (err) {
      showToast(err.message, true);
      navigate('/units');
    }
  };

  useEffect(() => { loadUnit(); }, [id]);

  const handleTransition = async (toState) => {
    try {
      await api.transition(id, toState);
      showToast('Unit updated');
      loadUnit();
      refresh();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  if (loading || !unit) {
    return (
      <div className="detail-page">
        <div className="loading-state" style={{ padding: 40 }}>
          <div className="loading-shimmer" style={{ height: 60, marginBottom: 20 }} />
          <div className="loading-shimmer" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  const labels = dashboard?.labels || {};
  const transitions = VALID_TRANSITIONS[unit.current_state] || [];
  const currentStageIdx = STAGE_ORDER.indexOf(unit.current_state);
  const completedStages = new Set(unit.events?.map((e) => e.to_state) || []);

  return (
    <div className="detail-page">
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate('/units')}>
        <ArrowBackRoundedIcon fontSize="small" />
        Back to Units
      </button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-left">
          <h1 className="detail-sku">{unit.sku}</h1>
          <span className={`state-badge state-${unit.current_state}`} style={{ fontSize: 14, padding: '6px 16px' }}>
            {labels[unit.current_state] || unit.current_state}
          </span>
        </div>
        <div className="detail-actions">
          {transitions.map((toState) => (
            <button
              key={toState}
              className={`btn ${ACTION_CONFIG[toState]?.cls || ''}`}
              onClick={() => handleTransition(toState)}
            >
              <StageIcon state={toState} fontSize="small" />
              {ACTION_CONFIG[toState]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress tracker */}
      <div className="progress-tracker card">
        <h3 className="section-title">Journey Progress</h3>
        <div className="progress-stages">
          {STAGE_ORDER.map((stage, i) => {
            const isCompleted = completedStages.has(stage);
            const isCurrent = stage === unit.current_state;
            const isSkipped = !isCompleted && i < currentStageIdx;
            return (
              <div key={stage} className="progress-stage-wrap" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                {i > 0 && (
                  <div className={`progress-line ${isCompleted || isCurrent ? 'completed' : ''}`} />
                )}
                <div className={`progress-node ${isCurrent ? 'current' : ''} ${isCompleted && !isCurrent ? 'completed' : ''} ${isSkipped ? 'skipped' : ''}`}>
                  <StageIcon state={stage} sx={{ fontSize: 18 }} />
                </div>
                <div className="progress-label">{labels[stage] || stage}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="detail-grid">
        {/* Info card */}
        <div className="info-card card">
          <h3 className="section-title">Unit Information</h3>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">Unit ID</span>
              <span className="info-value">#{unit.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">SKU</span>
              <span className="info-value">{unit.sku}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current State</span>
              <span className={`info-value state-${unit.current_state}`} style={{ fontWeight: 600 }}>
                {labels[unit.current_state]}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Created</span>
              <span className="info-value">{formatTime(unit.created_at)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated</span>
              <span className="info-value">{formatTime(unit.updated_at)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Events</span>
              <span className="info-value">{unit.events?.length || 0}</span>
            </div>
            {unit.events?.length >= 2 && (
              <div className="info-row">
                <span className="info-label">Journey Duration</span>
                <span className="info-value">
                  {formatDuration(unit.events[0].timestamp, unit.events[unit.events.length - 1].timestamp)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline card */}
        <div className="timeline-card card">
          <h3 className="section-title">Event Timeline</h3>
          <div className="timeline">
            {unit.events?.map((event, i) => (
              <div
                key={event.id}
                className="timeline-item"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="timeline-dot-wrap">
                  <div className={`timeline-dot ${i === unit.events.length - 1 ? 'current' : ''}`}>
                    <StageIcon state={event.to_state} sx={{ fontSize: 16 }} />
                  </div>
                  {i < unit.events.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content">
                  <div className="timeline-state">
                    {labels[event.to_state] || event.to_state}
                  </div>
                  <div className="timeline-time">{formatTime(event.timestamp)}</div>
                  {event.note && <div className="timeline-note">{event.note}</div>}
                  {i > 0 && (
                    <div className="timeline-duration">
                      +{formatDuration(unit.events[i - 1].timestamp, event.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
