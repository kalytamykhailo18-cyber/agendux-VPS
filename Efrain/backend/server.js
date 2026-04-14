const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: '127.0.0.1',
  database: 'marsmobile_prototype',
  user: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Valid state transitions
const VALID_TRANSITIONS = {
  DISPATCHED_USA: ['ARRIVED_BOG'],
  ARRIVED_BOG: ['DISPATCHED_BOG'],
  DISPATCHED_BOG: ['RESERVED_IN_TRANSIT', 'ARRIVED_DXB'],
  RESERVED_IN_TRANSIT: ['ARRIVED_DXB_SOLD'],
  ARRIVED_DXB: [], // final state
  ARRIVED_DXB_SOLD: [], // final state
};

const STATE_LABELS = {
  DISPATCHED_USA: 'Dispatched from USA',
  ARRIVED_BOG: 'In Bogota Warehouse',
  DISPATCHED_BOG: 'In Transit to Dubai',
  RESERVED_IN_TRANSIT: 'Reserved (In Transit)',
  ARRIVED_DXB: 'In Dubai Warehouse',
  ARRIVED_DXB_SOLD: 'Sold in Dubai',
};

// Dashboard stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT current_state, COUNT(*)::int as count
      FROM units
      GROUP BY current_state
    `);
    const counts = {};
    for (const state of Object.keys(VALID_TRANSITIONS)) {
      counts[state] = 0;
    }
    for (const row of result.rows) {
      counts[row.current_state] = row.count;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    res.json({ counts, total, labels: STATE_LABELS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List units with optional state filter
app.get('/api/units', async (req, res) => {
  try {
    const { state } = req.query;
    let query = 'SELECT * FROM units ORDER BY updated_at DESC';
    let params = [];
    if (state) {
      query = 'SELECT * FROM units WHERE current_state = $1 ORDER BY updated_at DESC';
      params = [state];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single unit with event history
app.get('/api/units/:id', async (req, res) => {
  try {
    const unit = await pool.query('SELECT * FROM units WHERE id = $1', [req.params.id]);
    if (unit.rows.length === 0) return res.status(404).json({ error: 'Unit not found' });

    const events = await pool.query(
      'SELECT * FROM events WHERE unit_id = $1 ORDER BY timestamp ASC',
      [req.params.id]
    );
    res.json({ ...unit.rows[0], events: events.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create units (dispatch from USA) - supports bulk
app.post('/api/units', async (req, res) => {
  const client = await pool.connect();
  try {
    const { count = 1, prefix = 'UNIT' } = req.body;
    const qty = Math.min(Math.max(1, parseInt(count)), 500);

    await client.query('BEGIN');

    // Get next number for SKU
    const lastUnit = await client.query(
      "SELECT sku FROM units WHERE sku LIKE $1 ORDER BY id DESC LIMIT 1",
      [`${prefix}-%`]
    );
    let nextNum = 1;
    if (lastUnit.rows.length > 0) {
      const match = lastUnit.rows[0].sku.match(/-(\d+)$/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }

    const created = [];
    for (let i = 0; i < qty; i++) {
      const sku = `${prefix}-${String(nextNum + i).padStart(4, '0')}`;
      const unit = await client.query(
        "INSERT INTO units (sku, current_state) VALUES ($1, 'DISPATCHED_USA') RETURNING *",
        [sku]
      );
      await client.query(
        "INSERT INTO events (unit_id, from_state, to_state, note) VALUES ($1, NULL, 'DISPATCHED_USA', 'Unit dispatched from USA')",
        [unit.rows[0].id]
      );
      created.push(unit.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ created: created.length, units: created });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Transition a single unit
app.post('/api/units/:id/transition', async (req, res) => {
  const client = await pool.connect();
  try {
    const { to_state, note = '' } = req.body;

    await client.query('BEGIN');

    // Lock the row
    const unit = await client.query(
      'SELECT * FROM units WHERE id = $1 FOR UPDATE',
      [req.params.id]
    );
    if (unit.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Unit not found' });
    }

    const current = unit.rows[0].current_state;
    const allowed = VALID_TRANSITIONS[current] || [];

    if (!allowed.includes(to_state)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot transition from "${STATE_LABELS[current]}" to "${STATE_LABELS[to_state] || to_state}". Allowed: ${allowed.map(s => STATE_LABELS[s]).join(', ') || 'none (final state)'}`,
      });
    }

    await client.query(
      'UPDATE units SET current_state = $1, updated_at = NOW() WHERE id = $2',
      [to_state, req.params.id]
    );
    await client.query(
      'INSERT INTO events (unit_id, from_state, to_state, note) VALUES ($1, $2, $3, $4)',
      [req.params.id, current, to_state, note || `Transitioned to ${STATE_LABELS[to_state]}`]
    );

    await client.query('COMMIT');

    // Return updated unit with events
    const updated = await pool.query('SELECT * FROM units WHERE id = $1', [req.params.id]);
    const events = await pool.query('SELECT * FROM events WHERE unit_id = $1 ORDER BY timestamp ASC', [req.params.id]);
    res.json({ ...updated.rows[0], events: events.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Bulk transition: move multiple units to the same state
app.post('/api/units/bulk-transition', async (req, res) => {
  const client = await pool.connect();
  try {
    const { unit_ids, to_state, note = '' } = req.body;
    if (!unit_ids || !Array.isArray(unit_ids) || unit_ids.length === 0) {
      return res.status(400).json({ error: 'unit_ids array is required' });
    }

    await client.query('BEGIN');

    const results = { success: [], failed: [] };

    for (const uid of unit_ids) {
      const unit = await client.query('SELECT * FROM units WHERE id = $1 FOR UPDATE', [uid]);
      if (unit.rows.length === 0) {
        results.failed.push({ id: uid, error: 'Not found' });
        continue;
      }

      const current = unit.rows[0].current_state;
      const allowed = VALID_TRANSITIONS[current] || [];

      if (!allowed.includes(to_state)) {
        results.failed.push({
          id: uid,
          sku: unit.rows[0].sku,
          error: `Cannot go from ${STATE_LABELS[current]} to ${STATE_LABELS[to_state]}`,
        });
        continue;
      }

      await client.query('UPDATE units SET current_state = $1, updated_at = NOW() WHERE id = $2', [to_state, uid]);
      await client.query(
        'INSERT INTO events (unit_id, from_state, to_state, note) VALUES ($1, $2, $3, $4)',
        [uid, current, to_state, note || `Transitioned to ${STATE_LABELS[to_state]}`]
      );
      results.success.push({ id: uid, sku: unit.rows[0].sku });
    }

    await client.query('COMMIT');
    res.json(results);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Reset all data (for demo purposes)
app.post('/api/reset', async (req, res) => {
  try {
    await pool.query('DELETE FROM events');
    await pool.query('DELETE FROM units');
    await pool.query('ALTER SEQUENCE units_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE events_id_seq RESTART WITH 1');
    res.json({ message: 'All data cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5100;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`MarsMobile API running on http://127.0.0.1:${PORT}`);
});
