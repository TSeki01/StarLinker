import { useTranslation } from 'react-i18next';

const NATIONALITIES = [
    { code: 'JP', key: 'japan' },
    { code: 'TW', key: 'taiwan' },
    { code: 'KR', key: 'korea' },
];

const TYPES = [
    { code: 'youtuber', key: 'youtuber' },
    { code: 'vtuber', key: 'vtuber' },
];

const SORTS = [
    { code: 'views', key: 'sort_views', icon: '👁' },
    { code: 'subscribers', key: 'sort_subscribers', icon: '👥' },
    { code: 'engagement', key: 'sort_engagement', icon: '⚡' },
];

export default function FilterBar({
    filters,
    onNationalityChange,
    onTypeToggle,
    onSortChange,
    onSearch,
    loading,
}) {
    const { t } = useTranslation();

    return (
        <div
            className="glass-card fade-in"
            style={{ padding: '18px 24px', marginBottom: '20px' }}
        >
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '20px',
                }}
            >
                {/* Nationality Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {t('filter.nationality')}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {NATIONALITIES.map((nat) => (
                            <button
                                key={nat.code}
                                id={`filter-nat-${nat.code}`}
                                className={`filter-btn ${filters.nationality === nat.code ? 'filter-btn--active' : ''
                                    }`}
                                onClick={() => onNationalityChange(nat.code)}
                            >
                                {t(`filter.${nat.key}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div
                    style={{
                        width: '1px',
                        height: '28px',
                        background: 'var(--color-border)',
                    }}
                />

                {/* Type Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {t('filter.type')}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {TYPES.map((tp) => (
                            <button
                                key={tp.code}
                                id={`filter-type-${tp.code}`}
                                className={`filter-btn ${filters.creatorType === tp.code ? 'filter-btn--active' : ''
                                    }`}
                                onClick={() => onTypeToggle(tp.code)}
                            >
                                {t(`filter.${tp.key}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div
                    style={{
                        width: '1px',
                        height: '28px',
                        background: 'var(--color-border)',
                    }}
                />

                {/* Sort Options */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {t('filter.sort')}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {SORTS.map((sort) => (
                            <button
                                key={sort.code}
                                id={`sort-${sort.code}`}
                                className={`sort-btn ${filters.sortBy === sort.code ? 'sort-btn--active' : ''
                                    }`}
                                onClick={() => onSortChange(sort.code)}
                            >
                                {sort.icon} {t(`filter.${sort.key}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Spacer to push search button to the right if space allows */}
                <div style={{ flex: 1 }}></div>

                {/* Search Button */}
                <button
                    onClick={onSearch}
                    disabled={loading}
                    style={{
                        background: 'var(--color-accent-blue)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(134, 203, 179, 0.3)',
                    }}
                >
                    🔍 {loading ? t('status.loading_short', { defaultValue: '...' }) : t('filter.search')}
                </button>
            </div>
        </div>
    );
}
