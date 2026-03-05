import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import RankingList from './components/RankingList';

const API_BASE = import.meta.env.PROD
    ? ''
    : '';

function App() {
    const { t } = useTranslation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSlow, setLoadingSlow] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        nationality: 'TW',
        creatorType: 'youtuber',
        sortBy: 'views',
    });

    const fetchData = async () => {
        setHasSearched(true);
        setLoading(true);
        setLoadingSlow(false);
        setError(null);

        // After 2 seconds, indicate it's a slow load to show the "please wait" message
        const slowTimer = setTimeout(() => {
            setLoadingSlow(true);
        }, 2000);

        try {
            const params = new URLSearchParams();
            if (filters.nationality) {
                params.set('nationality', filters.nationality);
            }
            if (filters.creatorType) {
                params.set('creator_type', filters.creatorType);
            }
            params.set('sort_by', filters.sortBy);

            const response = await fetch(`${API_BASE}/api/videos?${params}`);
            if (!response.ok) {
                if (response.status === 503 || response.status === 502) {
                    throw new Error(t('status.server_starting'));
                }
                throw new Error(`${t('status.error')} (HTTP ${response.status})`);
            }

            const data = await response.json();
            setResults(data.results || []);
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || t('status.error'));
        } finally {
            clearTimeout(slowTimer);
            setLoading(false);
            setLoadingSlow(false);
        }
    };

    // Remove initial fetch so it starts blank
    useEffect(() => {
        // Just empty, waiting for user to click Search
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleNationalityChange = (nat) => {
        setFilters((prev) => ({ ...prev, nationality: nat }));
    };

    const handleTypeToggle = (type) => {
        setFilters((prev) => ({
            ...prev,
            creatorType: type,
        }));
    };

    return (
        <div className="min-h-screen" style={{ padding: '0 16px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <Header />

                <FilterBar
                    filters={filters}
                    onNationalityChange={handleNationalityChange}
                    onTypeToggle={handleTypeToggle}
                    onSortChange={(sort) => handleFilterChange('sortBy', sort)}
                    onSearch={fetchData}
                    loading={loading}
                />

                <RankingList
                    results={results}
                    loading={loading}
                    loadingSlow={loadingSlow}
                    hasSearched={hasSearched}
                    error={error}
                    sortBy={filters.sortBy}
                    onRetry={fetchData}
                />
            </div>
        </div>
    );
}

export default App;
