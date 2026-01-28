import { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol, height = '100%' }) {
    const containerRef = useRef(null);
    const widgetRef = useRef(null);

    useEffect(() => {
        // Clear previous widget
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        // Create widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container';
        widgetContainer.style.height = '100%';
        widgetContainer.style.width = '100%';

        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container__widget';
        widgetDiv.style.height = 'calc(100% - 32px)';
        widgetDiv.style.width = '100%';
        widgetContainer.appendChild(widgetDiv);

        // Create and inject script
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: symbol,
            interval: 'D',
            timezone: 'Asia/Kolkata',
            theme: 'dark',
            style: '1',
            locale: 'en',
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: false,
            save_image: false,
            calendar: false,
            hide_volume: false,
            support_host: 'https://www.tradingview.com',
            backgroundColor: 'rgba(18, 18, 26, 1)',
            gridColor: 'rgba(255, 255, 255, 0.03)',
            allow_symbol_change: false
        });

        widgetContainer.appendChild(script);
        containerRef.current.appendChild(widgetContainer);

        widgetRef.current = widgetContainer;

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [symbol]);

    return (
        <div
            ref={containerRef}
            style={{ height, width: '100%' }}
        />
    );
}

// Memoize to prevent unnecessary re-renders
export default memo(TradingViewWidget);
