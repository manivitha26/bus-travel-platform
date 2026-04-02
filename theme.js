/* ============================================================
   THEME — Dark/Light Mode with persistence
   ============================================================ */

const Theme = {
  current: 'light',

  init() {
    // Check saved preference, then system preference
    const saved = Utils.store.get('theme');
    if (saved) {
      this.current = saved;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.current = prefersDark ? 'dark' : 'light';
    }
    this.apply();

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!Utils.store.get('theme')) {
        this.current = e.matches ? 'dark' : 'light';
        this.apply();
      }
    });
  },

  apply() {
    document.documentElement.setAttribute('data-theme', this.current);
    this.updateToggleUI();
  },

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    Utils.store.set('theme', this.current);
    this.apply();
  },

  setTheme(theme) {
    this.current = theme;
    Utils.store.set('theme', theme);
    this.apply();
  },

  updateToggleUI() {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
      const icon = toggle.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = this.current === 'dark' ? '☀️' : '🌙';
      }
    });

    const checkboxes = document.querySelectorAll('.theme-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = this.current === 'dark';
    });
  },

  isDark() {
    return this.current === 'dark';
  }
};
