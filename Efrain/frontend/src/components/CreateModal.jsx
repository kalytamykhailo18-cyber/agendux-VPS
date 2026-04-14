import { useState } from 'react';

export default function CreateModal({ onClose, onCreate }) {
  const [count, setCount] = useState(5);
  const [prefix, setPrefix] = useState('MM');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(count, prefix);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dispatch from USA</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Number of units</label>
              <input
                type="number"
                className="form-input"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                min={1}
                max={500}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>SKU Prefix</label>
              <input
                type="text"
                className="form-input"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={10}
                placeholder="MM"
              />
            </div>
            <div className="form-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                Dispatch {count} unit{count !== 1 ? 's' : ''}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
