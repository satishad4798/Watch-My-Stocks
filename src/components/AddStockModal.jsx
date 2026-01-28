import { useState } from 'react';

function AddStockModal({ groups, onAdd, onClose }) {
    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [exchange, setExchange] = useState('NSE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!symbol.trim() || !name.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onAdd({
                symbol: `${exchange}:${symbol.toUpperCase().trim()}`,
                name: name.trim(),
                group_id: groupId ? parseInt(groupId) : null
            });
        } catch (err) {
            setError('Failed to add stock. It may already exist.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Add Stock to Watchlist</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div style={{
                                color: 'var(--danger)',
                                marginBottom: 'var(--space-md)',
                                padding: 'var(--space-sm)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Exchange Selection */}
                        <div className="form-group">
                            <label className="form-label">Exchange *</label>
                            <select
                                className="form-select"
                                value={exchange}
                                onChange={(e) => setExchange(e.target.value)}
                            >
                                <option value="NSE">NSE (National Stock Exchange)</option>
                                <option value="BSE">BSE (Bombay Stock Exchange)</option>
                                <option value="NASDAQ">NASDAQ</option>
                                <option value="NYSE">NYSE (New York)</option>
                                <option value="BINANCE">Binance (Crypto)</option>
                            </select>
                        </div>

                        {/* Symbol Input */}
                        <div className="form-group">
                            <label className="form-label">Symbol *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., RELIANCE, TCS, INFY"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                autoFocus
                            />
                            <p className="form-hint">
                                Full symbol will be: {exchange}:{symbol || 'SYMBOL'}
                            </p>
                        </div>

                        {/* Name Input */}
                        <div className="form-group">
                            <label className="form-label">Company Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Reliance Industries Ltd"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Group Selection */}
                        <div className="form-group">
                            <label className="form-label">Group (Optional)</label>
                            <select
                                className="form-select"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                            >
                                <option value="">No Group</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !symbol.trim() || !name.trim()}
                        >
                            {loading ? 'Adding...' : 'Add Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddStockModal;
