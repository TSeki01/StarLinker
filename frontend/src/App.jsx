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
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        nationality: ['JP', 'TW', 'KR'],
        creatorType: null,
        sortBy: 'views',
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.nationality.length > 0 && filters.nationality.length < 3) {
                params.set('nationality', filters.nationality.join(','));
            }
            if (filters.creatorType) {
                params.set('creator_type', filters.creatorType);
            }
            params.set('sort_by', filters.sortBy);

            const response = await fetch(`${API_BASE}/api/videos?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setResults(data.results || []);
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleNationalityToggle = (nat) => {
        setFilters((prev) => {
            const current = [...prev.nationality];
            const idx = current.indexOf(nat);
            if (idx >= 0) {
                if (current.length > 1) current.splice(idx, 1);
            } else {
                current.push(nat);
            }
            return { ...prev, nationality: current };
        });
    };

    const handleTypeToggle = (type) => {
        setFilters((prev) => ({
            ...prev,
            creatorType: prev.creatorType === type ? null : type,
        }));
    };

    return (
        <div className="min-h-screen" style={{ padding: '0 16px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <Header />

                <FilterBar
                    filters={filters}
                    onNationalityToggle={handleNationalityToggle}
                    onTypeToggle={handleTypeToggle}
                    onSortChange={(sort) => handleFilterChange('sortBy', sort)}
                />

                <RankingList
                    results={results}
                    loading={loading}
                    error={error}
                    sortBy={filters.sortBy}
                    onRetry={fetchData}
                />
            </div>
        </div>
    );
}

export default App;
