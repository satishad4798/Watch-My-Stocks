import { useEffect } from 'react';
import TradingViewWidget from './TradingViewWidget';

function FullscreenModal({ stock, onClose }) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div className="fullscreen-modal">
            {/* Header */}
            <div className="fullscreen-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.25rem',
                        fontWeight: 700
                    }}>
                        {stock.symbol}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{stock.name}</span>
                    {stock.group_name && (
                        <span
                            className="group-badge"
                            style={{
                                background: `${stock.group_color}20`,
                                color: stock.group_color
                            }}
                        >
                            {stock.group_name}
                        </span>
                    )}
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={onClose}
                >
                    ✕ Close (Esc)
                </button>
            </div>

            {/* Fullscreen Chart */}
            <div className="fullscreen-chart">
                <TradingViewWidget symbol={stock.symbol} height="100%" />
            </div>
        </div>
    );
}

export default FullscreenModal;
