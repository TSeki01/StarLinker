import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
];

export default function Header() {
    const { t, i18n } = useTranslation();

    return (
        <header
            className="fade-in"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '28px 0 20px',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '24px',
            }}
        >
            {/* Logo & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                    style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-accent-blue)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '800',
                        boxShadow: '0 4px 16px rgba(134, 203, 179, 0.4)',
                    }}
                >
                    ✦
                </div>
                <div>
                    <h1
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            letterSpacing: '-0.5px',
                            color: 'var(--color-text-primary)',
                            lineHeight: 1.2,
                        }}
                    >
                        {t('app_title')}
                    </h1>
                    <p
                        style={{
                            fontSize: '0.78rem',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                        }}
                    >
                        {t('app_subtitle')}
                    </p>
                </div>
            </div>

            {/* Language Selector */}
            <div className="lang-selector">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        id={`lang-${lang.code}`}
                        className={`lang-btn ${i18n.language === lang.code ? 'lang-btn--active' : ''
                            }`}
                        onClick={() => i18n.changeLanguage(lang.code)}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </header>
    );
}
