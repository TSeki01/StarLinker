import { useTranslation } from 'react-i18next';
import VideoCard from './VideoCard';

export default function RankingList({ results, loading, loadingSlow, hasSearched, error, sortBy, onRetry }) {
    const { t } = useTranslation();

    // Initial Welcome State
    if (!hasSearched) {
        return (
            <div
                className="glass-card slide-up"
                style={{
                    padding: '64px 24px',
                    textAlign: 'center',
                    maxWidth: '800px',
                    margin: '0 auto',
                    marginTop: '40px'
                }}
            >
                <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🌟</div>
                <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1.4rem', marginBottom: '16px', fontWeight: 'bold' }}>
                    {t('status.welcome_title')}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '12px' }}>
                    {t('status.welcome_desc1')}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {t('status.welcome_desc2')}
                </p>
            </div>
        );
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="glass-card slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Slow Loading Indicator overlay */}
                {loadingSlow && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        zIndex: 20, textAlign: 'center', padding: '24px'
                    }}>
                        <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '16px' }} />
                        <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', marginBottom: '8px' }}>{t('status.loading_slow_title')}</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                            {t('status.loading_slow_desc')}
                        </p>
                    </div>
                )}
                {/* Header Row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr 1fr 100px 100px 90px',
                        gap: '12px',
                        padding: '12px 20px',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'rgba(255,255,255,0.5)',
                    }}
                >
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>{t('table.rank')}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>{t('table.channel')}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>{t('table.video_title')}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', textAlign: 'right' }}>{t('table.views')}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', textAlign: 'right' }}>{t('table.subscribers')}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', textAlign: 'right' }}>{t('table.engagement')}</span>
                </div>
                {/* Skeleton Rows */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '48px 1fr 1fr 100px 100px 90px',
                            gap: '12px',
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--color-border)',
                        }}
                    >
                        <div className="skeleton" style={{ height: '16px', width: '24px' }} />
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div className="skeleton" style={{ height: '14px', width: '70%', marginBottom: '6px' }} />
                                <div className="skeleton" style={{ height: '10px', width: '40%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="skeleton" style={{ height: '14px', width: '85%', marginBottom: '6px' }} />
                            <div className="skeleton" style={{ height: '10px', width: '30%' }} />
                        </div>
                        <div className="skeleton" style={{ height: '14px', width: '60px', marginLeft: 'auto' }} />
                        <div className="skeleton" style={{ height: '14px', width: '60px', marginLeft: 'auto' }} />
                        <div className="skeleton" style={{ height: '14px', width: '50px', marginLeft: 'auto' }} />
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div
                className="glass-card slide-up"
                style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⚠️</div>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    {t('status.error')}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginBottom: '20px' }}>
                    {error}
                </p>
                <button
                    onClick={onRetry}
                    style={{
                        background: 'var(--color-accent-blue)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-primary)',
                    }}
                >
                    ↻ Retry
                </button>
            </div>
        );
    }

    // Empty state
    if (!results || results.length === 0) {
        return (
            <div
                className="glass-card slide-up"
                style={{
                    padding: '64px 24px',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                    {t('status.empty')}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '8px' }}>
                    {t('status.no_results')}
                </p>
            </div>
        );
    }

    // Results
    return (
        <div className="fade-in" style={{ marginBottom: '40px' }}>
            <div style={{ padding: '0 0 16px 8px', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                {t('status.result_count_message', { count: results.length })}
            </div>
            <div className="glass-card slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Header Row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr 1fr 100px 100px 90px',
                        gap: '12px',
                        padding: '12px 20px',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'rgba(255,255,255,0.95)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t('table.rank')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t('table.channel')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t('table.video_title')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: sortBy === 'views' ? 'var(--color-accent-blue)' : 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                        {t('table.views')} {sortBy === 'views' && '▼'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: sortBy === 'subscribers' ? 'var(--color-accent-blue)' : 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                        {t('table.subscribers')} {sortBy === 'subscribers' && '▼'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: sortBy === 'engagement' ? 'var(--color-accent-blue)' : 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                        {t('table.engagement')} {sortBy === 'engagement' && '▼'}
                    </span>
                </div>

                {/* Data Rows */}
                {results.map((result, idx) => (
                    <VideoCard key={`${result.video.video_id}-${idx}`} result={result} rank={idx + 1} />
                ))}

                {/* Footer */}
                <div
                    style={{
                        padding: '12px 20px',
                        borderTop: '1px solid var(--color-border)',
                        background: 'rgba(255,255,255,0.5)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {results.length} results
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                        Monthly Star Promo ✦ Sponsored Content Analytics
                    </span>
                </div>
            </div>
        </div>
    );
}
