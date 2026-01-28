import { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol, height = '100%' }) {
    const containerRef = useRef(null);

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
        widgetDiv.style.height = '100%';
        widgetDiv.style.width = '100%';
        widgetContainer.appendChild(widgetDiv);

        // Use the symbol-overview widget which has better support for Indian stocks
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            symbols: [[symbol, symbol.split(':')[1] || symbol]],
            chartOnly: true,
            width: '100%',
            height: '100%',
            locale: 'en',
            colorTheme: 'dark',
            autosize: true,
            showVolume: true,
            showMA: false,
            hideDateRanges: false,
            hideMarketStatus: true,
            hideSymbolLogo: false,
            scalePosition: 'right',
            scaleMode: 'Normal',
            fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
            fontSize: '10',
            noTimeScale: false,
            valuesTracking: '1',
            changeMode: 'price-and-percent',
            chartType: 'area',
            lineWidth: 2,
            lineType: 0,
            dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444'
        });

        widgetContainer.appendChild(script);
        containerRef.current.appendChild(widgetContainer);

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
