import { ref } from 'vue';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'theme';

// Default to light mode
const theme = ref<Theme>('light');

export function useTheme() {
  const applyTheme = (targetTheme: Theme) => {
    theme.value = targetTheme;
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (targetTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      try {
        localStorage.setItem(THEME_KEY, targetTheme);
      } catch (_) {}

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', targetTheme === 'dark' ? '#141414' : '#ffffff');
      }
    }
  };

  const toggleTheme = () => {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark');
  };

  const initTheme = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark') {
        applyTheme('dark');
        return;
      }
    } catch (_) {}
    // Default is light mode
    applyTheme('light');
  };

  return {
    theme,
    toggleTheme,
    applyTheme,
    initTheme,
  };
}
