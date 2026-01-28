import { useState, useEffect, useCallback } from 'react';
import './index.css';
import StockCard from './components/StockCard';
import AddStockModal from './components/AddStockModal';
import FullscreenModal from './components/FullscreenModal';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [stocks, setStocks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullscreenStock, setFullscreenStock] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [showArchived, selectedGroup]);

  const fetchData = async () => {
    try {
      const [stocksRes, groupsRes] = await Promise.all([
        fetch(`${API_URL}/stocks?archived=${showArchived}${selectedGroup ? `&group_id=${selectedGroup}` : ''}`),
        fetch(`${API_URL}/groups`)
      ]);

      const stocksData = await stocksRes.json();
      const groupsData = await groupsRes.json();

      setStocks(stocksData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (stockData) => {
    try {
      const res = await fetch(`${API_URL}/stocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockData)
      });

      if (res.ok) {
        const newStock = await res.json();
        setStocks(prev => [newStock, ...prev]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const handleUpdateStock = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/stocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const updatedStock = await res.json();
        setStocks(prev => prev.map(s => s.id === id ? updatedStock : s));
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleArchiveStock = async (id) => {
    try {
      await fetch(`${API_URL}/stocks/${id}/archive`, { method: 'POST' });
      setStocks(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error archiving stock:', error);
    }
  };

  const handleUnarchiveStock = async (id) => {
    try {
      await fetch(`${API_URL}/stocks/${id}/unarchive`, { method: 'POST' });
      fetchData();
    } catch (error) {
      console.error('Error unarchiving stock:', error);
    }
  };

  const handleDeleteStock = async (id) => {
    if (!confirm('Permanently delete this stock?')) return;

    try {
      await fetch(`${API_URL}/stocks/${id}`, { method: 'DELETE' });
      setStocks(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  // Filter stocks by search query
  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (stock.note && stock.note.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group stocks by their group
  const groupedStocks = groups.reduce((acc, group) => {
    acc[group.id] = filteredStocks.filter(s => s.group_id === group.id);
    return acc;
  }, {});

  // Ungrouped stocks
  const ungroupedStocks = filteredStocks.filter(s => !s.group_id);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📈</span>
            <h1>Stock Watchlist</h1>
          </div>

          <div className="header-actions">
            {/* Search */}
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search stocks or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${!showArchived ? 'active' : ''}`}
                onClick={() => { setShowArchived(false); setSelectedGroup(null); }}
              >
                Active
              </button>
              <button
                className={`tab ${showArchived ? 'active' : ''}`}
                onClick={() => { setShowArchived(true); setSelectedGroup(null); }}
              >
                Archived
              </button>
            </div>

            {/* Group Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
            >
              <option value="">All Groups</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            {/* Add Stock Button */}
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <span>➕</span> Add Stock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-text">
              {showArchived
                ? 'No archived stocks yet'
                : searchQuery
                  ? 'No stocks match your search'
                  : 'Start by adding your first stock!'}
            </p>
            {!showArchived && !searchQuery && (
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                Add Your First Stock
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Render ungrouped stocks first */}
            {ungroupedStocks.length > 0 && !selectedGroup && (
              <section className="group-section">
                <div className="group-header">
                  <span
                    className="group-badge"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                  >
                    📌 Uncategorized
                  </span>
                  <span className="group-count">{ungroupedStocks.length} stocks</span>
                </div>
                <div className="stock-grid">
                  {ungroupedStocks.map(stock => (
                    <StockCard
                      key={stock.id}
                      stock={stock}
                      groups={groups}
                      onUpdate={handleUpdateStock}
                      onArchive={handleArchiveStock}
                      onUnarchive={handleUnarchiveStock}
                      onDelete={handleDeleteStock}
                      onFullscreen={() => setFullscreenStock(stock)}
                      showArchived={showArchived}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Render grouped stocks */}
            {groups.map(group => {
              const groupStocks = groupedStocks[group.id] || [];
              if (groupStocks.length === 0) return null;

              return (
                <section key={group.id} className="group-section">
                  <div className="group-header">
                    <span
                      className="group-badge"
                      style={{ background: `${group.color}20`, color: group.color }}
                    >
                      {group.name}
                    </span>
                    <span className="group-count">{groupStocks.length} stocks</span>
                  </div>
                  <div className="stock-grid">
                    {groupStocks.map(stock => (
                      <StockCard
                        key={stock.id}
                        stock={stock}
                        groups={groups}
                        onUpdate={handleUpdateStock}
                        onArchive={handleArchiveStock}
                        onUnarchive={handleUnarchiveStock}
                        onDelete={handleDeleteStock}
                        onFullscreen={() => setFullscreenStock(stock)}
                        showArchived={showArchived}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </main>

      {/* Add Stock Modal */}
      {showAddModal && (
        <AddStockModal
          groups={groups}
          onAdd={handleAddStock}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Fullscreen Chart Modal */}
      {fullscreenStock && (
        <FullscreenModal
          stock={fullscreenStock}
          onClose={() => setFullscreenStock(null)}
        />
      )}
    </div>
  );
}

export default App;
