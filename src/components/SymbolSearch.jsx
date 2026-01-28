import { useState, useEffect, useRef, useCallback } from 'react';

function SymbolSearch({ value, onChange, onSelect, exchange }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const debounceRef = useRef(null);

    // Map exchange to TradingView exchange code
    const exchangeMap = {
        'NSE': 'NSE',
        'BSE': 'BSE',
        'NASDAQ': 'NASDAQ',
        'NYSE': 'NYSE',
        'BINANCE': 'BINANCE'
    };

    // Search for symbols using backend proxy
    const searchSymbols = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 1) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);

        try {
            // Using our backend proxy to avoid CORS issues
            const response = await fetch(
                `http://localhost:3001/api/search-symbols?query=${encodeURIComponent(searchQuery)}&exchange=${exchangeMap[exchange] || ''}`
            );

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.symbols || []);
            }
        } catch (error) {
            console.error('Symbol search error:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [exchange]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length >= 1) {
            debounceRef.current = setTimeout(() => {
                searchSymbols(query);
            }, 300);
        } else {
            setSuggestions([]);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, searchSymbols]);

    // Handle input change
    const handleInputChange = (e) => {
        const newValue = e.target.value.toUpperCase();
        setQuery(newValue);
        onChange(newValue);
        setShowDropdown(true);
        setSelectedIndex(-1);
    };

    // Handle suggestion selection
    const handleSelect = (suggestion) => {
        setQuery(suggestion.symbol);
        onChange(suggestion.symbol);
        onSelect(suggestion);
        setShowDropdown(false);
        setSuggestions([]);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="symbol-search">
            <input
                ref={inputRef}
                type="text"
                className="form-input"
                placeholder="Start typing... e.g., RELIANCE, TCS, INFY"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= 1 && setShowDropdown(true)}
                autoComplete="off"
                autoFocus
            />

            {/* Loading indicator */}
            {isLoading && (
                <div className="symbol-search-loading">
                    <div className="spinner-small"></div>
                </div>
            )}

            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div ref={dropdownRef} className="symbol-suggestions">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.exchange}-${suggestion.symbol}`}
                            className={`symbol-suggestion ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={() => handleSelect(suggestion)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="suggestion-main">
                                <span className="suggestion-symbol">{suggestion.symbol}</span>
                                <span className="suggestion-exchange">{suggestion.exchange}</span>
                            </div>
                            <div className="suggestion-name">{suggestion.name}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* No results message */}
            {showDropdown && query.length >= 2 && !isLoading && suggestions.length === 0 && (
                <div className="symbol-suggestions">
                    <div className="symbol-no-results">
                        No stocks found for "{query}"
                    </div>
                </div>
            )}
        </div>
    );
}

export default SymbolSearch;
