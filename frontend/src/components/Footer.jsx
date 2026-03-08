import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer
            style={{
                padding: '40px 0 60px',
                textAlign: 'center',
                borderTop: '1px solid var(--color-border)',
                marginTop: '40px',
                opacity: 0.8
            }}
        >
            <p
                style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                    fontWeight: '500',
                    letterSpacing: '0.5px'
                }}
            >
                © 2026 Tune Seki
            </p>
            <p
                style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '8px',
                    opacity: 0.6
                }}
            >
                {t('app_title')} ✦ Sponsored Content Analytics
            </p>
        </footer>
    );
}
