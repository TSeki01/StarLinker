import { useTranslation } from 'react-i18next';

function formatNumber(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
}

export default function VideoCard({ result, rank }) {
    const { t } = useTranslation();
    const { creator, video, engagement_rate } = result;

    const natColors = { JP: 'var(--color-jp)', TW: 'var(--color-tw)', KR: 'var(--color-kr)' };

    return (
        <div className="video-row fade-in" style={{ animationDelay: `${rank * 40}ms` }}>
            {/* Rank */}
            <div
                style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: rank <= 3 ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)',
                    textAlign: 'center',
                    minWidth: '36px',
                }}
            >
                {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
            </div>

            {/* Channel Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {creator.profile_image_url ? (
                    <img
                        src={creator.profile_image_url}
                        alt={creator.name}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: `2px solid ${natColors[creator.nationality] || 'var(--color-border)'}`,
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--color-bg-glass)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            flexShrink: 0,
                            border: `2px solid ${natColors[creator.nationality] || 'var(--color-border)'}`,
                        }}
                    >
                        {creator.name?.charAt(0) || '?'}
                    </div>
                )}
                <div style={{ minWidth: 0 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '2px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                color: 'var(--color-text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {creator.name}
                        </span>
                        <span
                            className={`nat-dot nat-dot--${creator.nationality?.toLowerCase()}`}
                            title={creator.nationality}
                        />
                        {creator.type === 'vtuber' && (
                            <span
                                style={{
                                    fontSize: '0.6rem',
                                    fontWeight: '600',
                                    color: 'white',
                                    background: 'var(--color-accent-blue)',
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    letterSpacing: '0.3px',
                                }}
                            >
                                VTuber
                            </span>
                        )}
                    </div>
                    <span
                        style={{
                            fontSize: '0.72rem',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        {formatNumber(creator.subscriber_count)} {t('table.subscribers')}
                    </span>
                </div>
            </div>

            {/* Video Title + PR badge */}
            <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {video.is_sponsored && <span className="pr-badge">🏷 {t('badge.pr')}</span>}
                    <a
                        href={`https://www.youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                        }}
                        title={video.title}
                    >
                        {video.title}
                    </a>
                </div>
                {video.published_at && (
                    <span
                        style={{
                            fontSize: '0.68rem',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                            display: 'block',
                        }}
                    >
                        {new Date(video.published_at).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* Views */}
            <div className="stat-number" style={{ textAlign: 'right', color: 'var(--color-accent-blue)' }}>
                {formatNumber(video.view_count)}
            </div>

            {/* Subscribers */}
            <div className="stat-number" style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                {formatNumber(creator.subscriber_count)}
            </div>

            {/* Engagement Rate */}
            <div
                className="stat-number"
                style={{
                    textAlign: 'right',
                    color:
                        engagement_rate > 100
                            ? 'var(--color-jp)'
                            : engagement_rate > 50
                                ? 'var(--color-accent-blue)'
                                : 'var(--color-text-secondary)'
                }}
            >
                {engagement_rate.toFixed(1)}%
            </div>
        </div>
    );
}
