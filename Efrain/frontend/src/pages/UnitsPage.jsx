import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { api } from '../api';
import CreateModal from '../components/CreateModal';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import './UnitsPage.css';

const VALID_TRANSITIONS = {
  DISPATCHED_USA: ['ARRIVED_BOG'],
  ARRIVED_BOG: ['DISPATCHED_BOG'],
  DISPATCHED_BOG: ['RESERVED_IN_TRANSIT', 'ARRIVED_DXB'],
  RESERVED_IN_TRANSIT: ['ARRIVED_DXB_SOLD'],
  ARRIVED_DXB: [],
  ARRIVED_DXB_SOLD: [],
};

const ACTION_CONFIG = {
  ARRIVED_BOG: { label: 'Arrived Bogota', cls: 'btn-green' },
  DISPATCHED_BOG: { label: 'Dispatch to Dubai', cls: 'btn-orange' },
  RESERVED_IN_TRANSIT: { label: 'Reserve for Sale', cls: 'btn-purple' },
  ARRIVED_DXB: { label: 'Arrived Dubai', cls: 'btn-indigo' },
  ARRIVED_DXB_SOLD: { label: 'Arrived & Sold', cls: 'btn-indigo' },
};

const STATE_TITLES = {
  DISPATCHED_USA: 'USA Outbound',
  ARRIVED_BOG: 'Bogota Warehouse',
  DISPATCHED_BOG: 'In Transit to Dubai',
  RESERVED_IN_TRANSIT: 'Reserved (In Transit)',
  ARRIVED_DXB: 'Dubai Warehouse',
  ARRIVED_DXB_SOLD: 'Sold in Dubai',
};

function formatTime(ts) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function UnitsPage() {
  const { dashboard, refresh, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stateFilter = searchParams.get('state');
  const [units, setUnits] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.units(stateFilter).then((u) => {
      setUnits(u);
      setSelected(new Set());
      setLoading(false);
    }).catch((err) => {
      showToast(err.message, true);
      setLoading(false);
    });
  }, [stateFilter, dashboard]);

  const handleTransition = async (unitId, toState) => {
    try {
      await api.transition(unitId, toState);
      showToast('Unit updated');
      refresh();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleBulkTransition = async (toState) => {
    if (selected.size === 0) return;
    try {
      const result = await api.bulkTransition([...selected], toState);
      setSelected(new Set());
      const ok = result.success.length;
      const fail = result.failed.length;
      showToast(`${ok} updated${fail ? `, ${fail} failed` : ''}`);
      refresh();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleCreate = async (count, prefix) => {
    try {
      const result = await api.createUnits(count, prefix);
      setShowCreate(false);
      showToast(`${result.created} unit${result.created !== 1 ? 's' : ''} dispatched`);
      refresh();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const allSelected = units.length > 0 && units.every((u) => selected.has(u.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(units.map((u) => u.id)));
  };
  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  // Common transitions for selected units
  const bulkActions = () => {
    if (selected.size === 0) return [];
    const selectedUnits = units.filter((u) => selected.has(u.id));
    const sets = selectedUnits.map((u) => new Set(VALID_TRANSITIONS[u.current_state] || []));
    if (sets.length === 0) return [];
    return [...sets[0]].filter((t) => sets.every((s) => s.has(t)));
  };

  const labels = dashboard?.labels || {};

  return (
    <div className="units-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {stateFilter ? STATE_TITLES[stateFilter] || 'Units' : 'All Units'}
          </h1>
          <p className="page-subtitle">
            {units.length} unit{units.length !== 1 ? 's' : ''}
            {stateFilter && (
              <button className="clear-filter" onClick={() => setSearchParams({})}>
                Clear filter
              </button>
            )}
          </p>
        </div>
        <div className="page-actions">
          {selected.size > 0 && (
            <span className="selected-count">{selected.size} selected</span>
          )}
          {bulkActions().map((toState) => (
            <button
              key={toState}
              className={`btn btn-sm ${ACTION_CONFIG[toState]?.cls || ''}`}
              onClick={() => handleBulkTransition(toState)}
            >
              {ACTION_CONFIG[toState]?.label}
            </button>
          ))}
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <AddRoundedIcon fontSize="small" />
            Dispatch from USA
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${!stateFilter ? 'active' : ''}`}
          onClick={() => setSearchParams({})}
        >
          All {dashboard && <span className="tab-count">{dashboard.total}</span>}
        </button>
        {dashboard && Object.keys(VALID_TRANSITIONS).map((state) => (
          <button
            key={state}
            className={`filter-tab ${stateFilter === state ? 'active' : ''}`}
            onClick={() => setSearchParams({ state })}
          >
            <span className={`tab-dot state-dot-${state}`} />
            {STATE_TITLES[state]}
            <span className="tab-count">{dashboard.counts[state]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="loading-state">
            <div className="loading-shimmer" />
            <div className="loading-shimmer" />
            <div className="loading-shimmer" />
          </div>
        ) : units.length === 0 ? (
          <div className="empty-state">
            <Inventory2RoundedIcon sx={{ fontSize: 40, color: 'var(--text-secondary)', mb: 1 }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>No units found</p>
            <p style={{ marginTop: 4 }}>Dispatch units from USA to get started</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" className="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th>SKU</th>
                <th>Current State</th>
                <th>Last Updated</th>
                <th style={{ width: 200 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, i) => {
                const transitions = VALID_TRANSITIONS[unit.current_state] || [];
                return (
                  <tr
                    key={unit.id}
                    className={`unit-row ${selected.has(unit.id) ? 'selected-row' : ''}`}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selected.has(unit.id)}
                        onChange={() => toggle(unit.id)}
                      />
                    </td>
                    <td>
                      <span className="sku-link" onClick={() => navigate(`/units/${unit.id}`)}>
                        {unit.sku}
                      </span>
                    </td>
                    <td>
                      <span className={`state-badge state-${unit.current_state}`}>
                        {labels[unit.current_state] || unit.current_state}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {formatTime(unit.updated_at)}
                    </td>
                    <td>
                      <div className="action-btns">
                        {transitions.map((toState) => (
                          <button
                            key={toState}
                            className={`btn btn-sm ${ACTION_CONFIG[toState]?.cls || ''}`}
                            onClick={() => handleTransition(unit.id, toState)}
                          >
                            {ACTION_CONFIG[toState]?.label}
                          </button>
                        ))}
                        {transitions.length === 0 && (
                          <span className="final-label">Final</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
