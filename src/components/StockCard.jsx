import { useState, useCallback, useEffect, useRef } from 'react';
import TradingViewWidget from './TradingViewWidget';

function StockCard({
    stock,
    groups,
    onUpdate,
    onArchive,
    onUnarchive,
    onDelete,
    onFullscreen,
    showArchived
}) {
    const [note, setNote] = useState(stock.note || '');
    const [savedMessage, setSavedMessage] = useState(false);
    const saveTimeoutRef = useRef(null);

    // Auto-save note with debounce
    const handleNoteChange = useCallback((e) => {
        const newNote = e.target.value;
        setNote(newNote);

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        saveTimeoutRef.current = setTimeout(() => {
            onUpdate(stock.id, { note: newNote });
            setSavedMessage(true);
            setTimeout(() => setSavedMessage(false), 2000);
        }, 1000);
    }, [stock.id, onUpdate]);

    // Handle group change
    const handleGroupChange = (e) => {
        const groupId = e.target.value ? parseInt(e.target.value) : null;
        onUpdate(stock.id, { group_id: groupId });
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={`stock-card ${stock.is_archived ? 'archived' : ''}`}>
            {/* Card Header */}
            <div className="stock-card-header">
                <div className="stock-info">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span className="stock-name">{stock.name}</span>
                </div>

                <div className="stock-actions">
                    {/* Group Selector */}
                    <select
                        className="group-select"
                        value={stock.group_id || ''}
                        onChange={handleGroupChange}
                        title="Change group"
                    >
                        <option value="">No Group</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>

                    {/* Fullscreen Button */}
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onFullscreen}
                        title="View fullscreen"
                    >
                        ⛶
                    </button>

                    {/* Archive/Unarchive Button */}
                    {showArchived ? (
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => onUnarchive(stock.id)}
                            title="Restore from archive"
                        >
                            ↩️
                        </button>
                    ) : (
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => onArchive(stock.id)}
                            title="Archive stock"
                        >
                            📦
                        </button>
                    )}

                    {/* Delete Button */}
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => onDelete(stock.id)}
                        title="Delete permanently"
                        style={{ color: 'var(--danger)' }}
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* TradingView Chart */}
            <div className="chart-container">
                <TradingViewWidget symbol={stock.symbol} />
            </div>

            {/* Note Section */}
            <div className="note-section">
                <div className="note-label">
                    📝 Notes
                    {savedMessage && <span className="note-saved">✓ Saved</span>}
                </div>
                <textarea
                    className="note-textarea"
                    value={note}
                    onChange={handleNoteChange}
                    placeholder="Add your notes here... (auto-saves)"
                />
            </div>
        </div>
    );
}

export default StockCard;
