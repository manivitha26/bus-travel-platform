/* ============================================================
   I18N — Internationalization Engine
   ============================================================ */

const I18n = {
  currentLang: 'en',
  translations: {},
  supportedLangs: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ],

  async init() {
    const saved = Utils.store.get('language', 'en');
    await this.setLanguage(saved);
  },

  async loadLanguage(lang) {
    if (this.translations[lang]) return this.translations[lang];
    try {
      const res = await fetch(`lang/${lang}.json`);
      if (!res.ok) throw new Error('Failed to load language');
      this.translations[lang] = await res.json();
      return this.translations[lang];
    } catch (e) {
      console.warn(`Failed to load ${lang}, falling back to en`);
      if (lang !== 'en') return this.loadLanguage('en');
      return {};
    }
  },

  async setLanguage(lang) {
    await this.loadLanguage(lang);
    // Always load English as fallback
    if (lang !== 'en') await this.loadLanguage('en');
    this.currentLang = lang;
    Utils.store.set('language', lang);
    this.applyTranslations();
    document.documentElement.setAttribute('lang', lang);
  },

  // Get translation by dot-notation key, with optional interpolation
  t(key, params = {}) {
    let value = this._resolve(key, this.translations[this.currentLang]);
    // Fallback to English
    if (value === undefined || value === null) {
      value = this._resolve(key, this.translations['en']);
    }
    if (value === undefined || value === null) return key;
    // Interpolation: replace {{param}} with value
    if (params && typeof value === 'string') {
      Object.keys(params).forEach(k => {
        value = value.replace(new RegExp(`{{${k}}}`, 'g'), params[k]);
      });
    }
    return value;
  },

  _resolve(key, obj) {
    if (!obj) return undefined;
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  },

  // Apply translations to all elements with data-i18n attribute
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = this.t(key);
      if (translated && translated !== key) {
        el.textContent = translated;
      }
    });
    // Also handle placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translated = this.t(key);
      if (translated && translated !== key) {
        el.placeholder = translated;
      }
    });
    // Handle title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translated = this.t(key);
      if (translated && translated !== key) {
        el.title = translated;
      }
    });
  },

  // Get language selector HTML
  getLanguageSelector() {
    return this.supportedLangs.map(l =>
      `<div class="dropdown-item lang-option ${l.code === this.currentLang ? 'active' : ''}" 
           data-lang="${l.code}" onclick="I18n.setLanguage('${l.code}')">
        <span>${l.flag}</span>
        <span>${l.name}</span>
        ${l.code === this.currentLang ? '<span style="margin-left:auto">✓</span>' : ''}
      </div>`
    ).join('');
  }
};
