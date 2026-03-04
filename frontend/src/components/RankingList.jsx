import { useTranslation } from 'react-i18next';
import VideoCard from './VideoCard';

export default function RankingList({ results, loading, error, sortBy, onRetry }) {
    const { t } = useTranslation();

    // Loading skeleton
    if (loading) {
        return (
            <div className="glass-card slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Header Row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr 1fr 100px 100px 90px',
                        gap: '12px',
                        padding: '12px 20px',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'rgba(0,0,0,0.2)',
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
        <div className="glass-card slide-up" style={{ padding: '0', overflow: 'hidden', marginBottom: '40px' }}>
            {/* Header Row */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 1fr 100px 100px 90px',
                    gap: '12px',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--color-border)',
                    background: 'rgba(0,0,0,0.2)',
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
                    background: 'rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {results.length} results
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                    StarLinker ✦ Sponsored Content Analytics
                </span>
            </div>
        </div>
    );
}
