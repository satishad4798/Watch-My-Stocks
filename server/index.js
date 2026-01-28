import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ==================== SYMBOL SEARCH PROXY ====================

// Proxy for TradingView symbol search (to bypass CORS)
app.get('/api/search-symbols', async (req, res) => {
    const { query, exchange } = req.query;

    if (!query || query.length < 1) {
        return res.json({ symbols: [] });
    }

    try {
        // hl=0 disables HTML highlighting in results
        const url = `https://symbol-search.tradingview.com/symbol_search/v3/?text=${encodeURIComponent(query)}&hl=0&exchange=${exchange || ''}&lang=en&search_type=stocks&domain=production&sort_by_country=IN`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Origin': 'https://www.tradingview.com',
                'Referer': 'https://www.tradingview.com/'
            }
        });

        if (response.ok) {
            const data = await response.json();

            // Format and limit results (no HTML tags since hl=0)
            const symbols = (data.symbols || [])
                .slice(0, 10)
                .map(item => ({
                    symbol: item.symbol,
                    name: item.description || item.symbol,
                    exchange: item.exchange,
                    type: item.type,
                    fullSymbol: `${item.exchange}:${item.symbol}`
                }));

            res.json({ symbols });
        } else {
            res.json({ symbols: [], error: 'Search failed' });
        }
    } catch (error) {
        console.error('Symbol search error:', error);
        res.json({ symbols: [], error: error.message });
    }
});

// ==================== GROUPS ====================

// Get all groups
app.get('/api/groups', (req, res) => {
    const groups = db.prepare('SELECT * FROM groups ORDER BY id').all();
    res.json(groups);
});

// Create a new group
app.post('/api/groups', (req, res) => {
    const { name, color } = req.body;
    try {
        const result = db.prepare('INSERT INTO groups (name, color) VALUES (?, ?)').run(name, color || '#6366f1');
        res.json({ id: result.lastInsertRowid, name, color: color || '#6366f1' });
    } catch (err) {
        res.status(400).json({ error: 'Group already exists' });
    }
});

// Delete a group
app.delete('/api/groups/:id', (req, res) => {
    const { id } = req.params;
    // Move stocks to null group before deleting
    db.prepare('UPDATE stocks SET group_id = NULL WHERE group_id = ?').run(id);
    db.prepare('DELETE FROM groups WHERE id = ?').run(id);
    res.json({ success: true });
});

// ==================== STOCKS ====================

// Get all stocks (with optional filters)
app.get('/api/stocks', (req, res) => {
    const { archived, group_id } = req.query;

    let query = `
    SELECT s.*, g.name as group_name, g.color as group_color 
    FROM stocks s 
    LEFT JOIN groups g ON s.group_id = g.id 
    WHERE 1=1
  `;
    const params = [];

    if (archived !== undefined) {
        query += ' AND s.is_archived = ?';
        params.push(archived === 'true' ? 1 : 0);
    }

    if (group_id) {
        query += ' AND s.group_id = ?';
        params.push(group_id);
    }

    query += ' ORDER BY s.added_at DESC';

    const stocks = db.prepare(query).all(...params);
    res.json(stocks);
});

// Add a new stock
app.post('/api/stocks', (req, res) => {
    const { symbol, name, group_id, note } = req.body;
    try {
        const result = db.prepare(
            'INSERT INTO stocks (symbol, name, group_id, note) VALUES (?, ?, ?, ?)'
        ).run(symbol.toUpperCase(), name, group_id || null, note || '');

        const stock = db.prepare(`
      SELECT s.*, g.name as group_name, g.color as group_color 
      FROM stocks s 
      LEFT JOIN groups g ON s.group_id = g.id 
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

        res.json(stock);
    } catch (err) {
        res.status(400).json({ error: 'Stock already exists' });
    }
});

// Update a stock (note, group, archive status)
app.put('/api/stocks/:id', (req, res) => {
    const { id } = req.params;
    const { note, group_id, is_archived, name } = req.body;

    const updates = [];
    const params = [];

    if (note !== undefined) {
        updates.push('note = ?');
        params.push(note);
    }
    if (group_id !== undefined) {
        updates.push('group_id = ?');
        params.push(group_id);
    }
    if (is_archived !== undefined) {
        updates.push('is_archived = ?');
        params.push(is_archived ? 1 : 0);
    }
    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }

    if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        db.prepare(`UPDATE stocks SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const stock = db.prepare(`
    SELECT s.*, g.name as group_name, g.color as group_color 
    FROM stocks s 
    LEFT JOIN groups g ON s.group_id = g.id 
    WHERE s.id = ?
  `).get(id);

    res.json(stock);
});

// Delete a stock permanently
app.delete('/api/stocks/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM stocks WHERE id = ?').run(id);
    res.json({ success: true });
});

// Archive a stock
app.post('/api/stocks/:id/archive', (req, res) => {
    const { id } = req.params;
    db.prepare('UPDATE stocks SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    res.json({ success: true });
});

// Unarchive a stock
app.post('/api/stocks/:id/unarchive', (req, res) => {
    const { id } = req.params;
    db.prepare('UPDATE stocks SET is_archived = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Network access: http://0.0.0.0:${PORT}`);
});
