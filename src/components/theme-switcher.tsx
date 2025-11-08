import { useTheme, Theme } from './theme-provider';

const themes = [
  { id: 'win95' as Theme, name: 'Early Web', emoji: '🌐' },
  { id: 'win98' as Theme, name: 'Windows 98', emoji: '💿' },
  { id: 'winxp' as Theme, name: 'Windows XP', emoji: '🪟' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      <div className="theme-switcher-label">
        Theme:
      </div>
      <div className="theme-switcher-buttons">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`theme-switcher-button ${theme === t.id ? 'active' : ''}`}
            title={t.name}
          >
            <span className="theme-switcher-emoji">{t.emoji}</span>
            <span className="theme-switcher-name">{t.name.replace('Windows ', '')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}