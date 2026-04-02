/* ============================================================
   APP — Main application controller, routing, initialization
   ============================================================ */

const App = {
  currentPage: 'home',

  async init() {
    // 1. Seed demo data
    SeedData.init();

    // 2. Init core systems
    Theme.init();
    await I18n.init();
    Auth.init();
    Notifications.init();

    // 3. Setup routing
    this.setupRouting();

    // 4. Bind global events
    this.bindEvents();

    // 5. Navigate to initial page
    const hash = window.location.hash.slice(1) || 'home';
    this.navigate(hash);

    // 6. Remove loading screen
    document.getElementById('loading-screen')?.classList.add('hidden');
  },

  setupRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'home';
      this.navigate(hash);
    });
  },

  navigate(page) {
    // Handle auth guarding
    const authRequired = ['notifications', 'profile', 'settings'];
    if (authRequired.includes(page) && !Auth.isLoggedIn()) {
      page = 'login';
    }

    this.currentPage = page;
    window.location.hash = page;

    // Hide all pages, show target
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-page') === page);
    });

    // Initialize page-specific content
    this.initPage(page);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile menu
    document.getElementById('mobile-nav')?.classList.remove('open');
  },

  initPage(page) {
    switch (page) {
      case 'home': this.renderHome(); break;
      case 'community': Community.init(); break;
      case 'routes': RoutePlanner.init(); break;
      case 'reviews': Reviews.init(); break;
      case 'notifications': Notifications.render(); break;
      case 'profile': this.renderProfile(); break;
      case 'settings': this.renderSettings(); break;
      case 'login': this.renderLogin(); break;
      case 'register': this.renderRegister(); break;
    }
    // Re-apply i18n
    I18n.applyTranslations();
  },

  renderHome() {
    const page = document.getElementById('page-home');
    if (!page) return;

    const routes = Utils.store.get('routes', []);
    const users = Utils.store.get('users', []);
    const reviews = Utils.store.get('reviews', []);

    page.innerHTML = `
      <!-- Hero -->
      <section class="hero">
        <div class="container">
          <div class="hero-content animate-slide-up">
            <h1>
              <span data-i18n="hero.title_1">${I18n.t('hero.title_1')}</span>
              <br>
              <span class="gradient-text" data-i18n="hero.title_2">${I18n.t('hero.title_2')}</span>
            </h1>
            <p data-i18n="hero.subtitle">${I18n.t('hero.subtitle')}</p>
            <div class="hero-actions">
              <a href="#routes" class="btn btn-accent btn-lg" data-i18n="hero.cta_plan">${I18n.t('hero.cta_plan')}</a>
              <a href="#community" class="btn btn-secondary btn-lg" style="background:rgba(255,255,255,0.15);color:#fff;border-color:rgba(255,255,255,0.25)" data-i18n="hero.cta_community">${I18n.t('hero.cta_community')}</a>
            </div>
            <div class="hero-stats">
              <div>
                <div class="hero-stat-value">${routes.length * 120}+</div>
                <div class="hero-stat-label" data-i18n="hero.stat_routes">${I18n.t('hero.stat_routes')}</div>
              </div>
              <div>
                <div class="hero-stat-value">${users.length * 1200}+</div>
                <div class="hero-stat-label" data-i18n="hero.stat_travelers">${I18n.t('hero.stat_travelers')}</div>
              </div>
              <div>
                <div class="hero-stat-value">${reviews.length * 340}+</div>
                <div class="hero-stat-label" data-i18n="hero.stat_reviews">${I18n.t('hero.stat_reviews')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Search -->
      <section class="container" style="position:relative;z-index:2">
        <div class="search-bar animate-slide-up">
          <div class="search-bar-inner">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label" data-i18n="search.from">${I18n.t('search.from')}</label>
              <input class="form-input" placeholder="${I18n.t('search.from_placeholder')}" id="home-search-from" data-i18n-placeholder="search.from_placeholder">
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label" data-i18n="search.to">${I18n.t('search.to')}</label>
              <input class="form-input" placeholder="${I18n.t('search.to_placeholder')}" id="home-search-to" data-i18n-placeholder="search.to_placeholder">
            </div>
            <button class="btn btn-primary btn-lg" onclick="App.homeSearch()" data-i18n="search.search_btn">${I18n.t('search.search_btn')}</button>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="container page-section">
        <div class="text-center mb-12">
          <h2 class="mb-3 animate-fade-in" data-i18n="features.title">${I18n.t('features.title')}</h2>
          <p class="text-lg" data-i18n="features.subtitle">${I18n.t('features.subtitle')}</p>
        </div>
        <div class="features-grid stagger-children">
          <div class="card feature-card hover-lift animate-slide-up">
            <div class="feature-card-icon">🗺️</div>
            <h4 data-i18n="features.route_planning">${I18n.t('features.route_planning')}</h4>
            <p data-i18n="features.route_planning_desc">${I18n.t('features.route_planning_desc')}</p>
          </div>
          <div class="card feature-card hover-lift animate-slide-up">
            <div class="feature-card-icon">👥</div>
            <h4 data-i18n="features.community">${I18n.t('features.community')}</h4>
            <p data-i18n="features.community_desc">${I18n.t('features.community_desc')}</p>
          </div>
          <div class="card feature-card hover-lift animate-slide-up">
            <div class="feature-card-icon">⭐</div>
            <h4 data-i18n="features.reviews">${I18n.t('features.reviews')}</h4>
            <p data-i18n="features.reviews_desc">${I18n.t('features.reviews_desc')}</p>
          </div>
        </div>
      </section>

      <!-- Popular Routes -->
      <section class="container page-section">
        <h2 class="mb-6 animate-fade-in">Popular Routes</h2>
        <div class="grid grid-3 gap-6 stagger-children">
          ${routes.slice(0, 3).map(route => {
            const avg = Reviews.getAvgRating(route.id);
            const count = Reviews.getRouteReviews(route.id).length;
            const gradients = ['linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#06b6d4,#22c55e)', 'linear-gradient(135deg,#f97316,#ec4899)'];
            return `
              <div class="card hover-lift animate-slide-up" style="overflow:hidden">
                <div style="height:120px;background:${gradients[routes.indexOf(route) % 3]};border-radius:var(--radius-lg);margin-bottom:var(--space-4);display:flex;align-items:center;justify-content:center">
                  <span style="font-size:3rem;opacity:0.5">🚌</span>
                </div>
                <h4 style="font-size:var(--text-base)">${Utils.escapeHTML(route.name)}</h4>
                <p class="text-sm mt-1">${Utils.escapeHTML(route.from)} → ${Utils.escapeHTML(route.to)}</p>
                <div class="flex items-center justify-between mt-3">
                  <div class="flex items-center gap-2">
                    ${Utils.starsHTML(avg)} <span class="text-xs text-muted">(${count})</span>
                  </div>
                  <span class="badge badge-primary">${route.price}</span>
                </div>
                <div class="flex gap-4 mt-3 text-xs text-muted">
                  <span>📏 ${route.distance}</span>
                  <span>⏱️ ${route.duration}</span>
                </div>
              </div>`;
          }).join('')}
        </div>
      </section>

      <!-- Footer -->
      ${this.renderFooter()}
    `;
  },

  homeSearch() {
    const from = document.getElementById('home-search-from')?.value;
    const to = document.getElementById('home-search-to')?.value;
    this.navigate('routes');
    setTimeout(() => {
      const startInput = document.getElementById('route-start');
      const endInput = document.getElementById('route-end');
      if (startInput && from) startInput.value = from;
      if (endInput && to) endInput.value = to;
      if (from && to) RoutePlanner.findRoutes();
    }, 200);
  },

  renderProfile() {
    const page = document.getElementById('page-profile');
    if (!page || !Auth.currentUser) return;

    const user = Auth.currentUser;
    const posts = Utils.store.get('posts', []).filter(p => p.userId === user.id);
    const reviews = Utils.store.get('reviews', []).filter(r => r.userId === user.id);

    page.innerHTML = `
      <div class="container page-section">
        <div class="profile-header animate-slide-up">
          ${Utils.avatar(user.name, 'xl')}
          <div>
            <div class="profile-name">
              ${Utils.escapeHTML(user.name)}
              ${user.verified ? '<span class="verified-badge" style="font-size:1.2rem">✓</span>' : `<button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;margin-left:8px" onclick="Auth.verifyAccount()">${I18n.t('profile.verify_account')}</button>`}
            </div>
            <div class="profile-bio">${Utils.escapeHTML(user.bio || '')}</div>
            <div class="profile-stats">
              <div class="profile-stat">
                <div class="profile-stat-value">${posts.length}</div>
                <div class="profile-stat-label" data-i18n="profile.posts">${I18n.t('profile.posts')}</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-value">${reviews.length}</div>
                <div class="profile-stat-label" data-i18n="profile.reviews_count">${I18n.t('profile.reviews_count')}</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-value">${(user.completedJourneys || []).length}</div>
                <div class="profile-stat-label" data-i18n="profile.journeys">${I18n.t('profile.journeys')}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="tabs">
          <div class="tab active" onclick="App.showProfileTab('posts')" data-i18n="profile.my_posts">${I18n.t('profile.my_posts')}</div>
          <div class="tab" onclick="App.showProfileTab('reviews')" data-i18n="profile.my_reviews">${I18n.t('profile.my_reviews')}</div>
        </div>

        <div id="profile-tab-content">
          <div class="stagger-children">
            ${posts.length === 0 ? '<p class="text-muted text-center mt-8">No posts yet</p>' : posts.map(p => Community.renderPostCard(p)).join('')}
          </div>
        </div>
      </div>
    `;
  },

  showProfileTab(tab) {
    document.querySelectorAll('#page-profile .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('profile-tab-content');
    if (!content || !Auth.currentUser) return;

    if (tab === 'posts') {
      const posts = Utils.store.get('posts', []).filter(p => p.userId === Auth.currentUser.id);
      content.innerHTML = `<div class="stagger-children">${posts.length === 0 ? '<p class="text-muted text-center mt-8">No posts yet</p>' : posts.map(p => Community.renderPostCard(p)).join('')}</div>`;
    } else {
      const reviews = Utils.store.get('reviews', []).filter(r => r.userId === Auth.currentUser.id);
      content.innerHTML = `<div class="stagger-children">${reviews.length === 0 ? '<p class="text-muted text-center mt-8">No reviews yet</p>' : reviews.map(r => Reviews.renderReviewCard(r)).join('')}</div>`;
    }
  },

  renderSettings() {
    const page = document.getElementById('page-settings');
    if (!page || !Auth.currentUser) return;

    const prefs = Notifications.getPrefs();

    page.innerHTML = `
      <div class="container page-section">
        <h1 class="mb-8 animate-fade-in" data-i18n="settings.title">${I18n.t('settings.title')}</h1>
        <div class="settings-layout">
          <div class="settings-nav">
            <div class="settings-nav-item active" onclick="App.scrollToSetting('appearance')">🎨 <span data-i18n="settings.appearance">${I18n.t('settings.appearance')}</span></div>
            <div class="settings-nav-item" onclick="App.scrollToSetting('language')">🌐 <span data-i18n="settings.language">${I18n.t('settings.language')}</span></div>
            <div class="settings-nav-item" onclick="App.scrollToSetting('notif-settings')">🔔 <span data-i18n="settings.notifications">${I18n.t('settings.notifications')}</span></div>
          </div>

          <div>
            <!-- Appearance -->
            <div class="settings-section" id="setting-appearance">
              <h3 class="settings-section-title" data-i18n="settings.appearance">${I18n.t('settings.appearance')}</h3>
              <div class="card">
                <div class="preference-row">
                  <div class="preference-info">
                    <div class="preference-label" data-i18n="settings.dark_mode">${I18n.t('settings.dark_mode')}</div>
                    <div class="preference-desc" data-i18n="settings.dark_mode_desc">${I18n.t('settings.dark_mode_desc')}</div>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" class="theme-checkbox" ${Theme.isDark() ? 'checked' : ''} onchange="Theme.toggle()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Language -->
            <div class="settings-section" id="setting-language">
              <h3 class="settings-section-title" data-i18n="settings.language">${I18n.t('settings.language')}</h3>
              <div class="card">
                <div class="preference-row">
                  <div class="preference-info">
                    <div class="preference-label" data-i18n="settings.language_select">${I18n.t('settings.language_select')}</div>
                    <div class="preference-desc" data-i18n="settings.language_desc">${I18n.t('settings.language_desc')}</div>
                  </div>
                  <select class="form-select" style="width:auto" onchange="I18n.setLanguage(this.value);App.renderSettings()">
                    ${I18n.supportedLangs.map(l => `<option value="${l.code}" ${I18n.currentLang === l.code ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="settings-section" id="setting-notif-settings">
              <h3 class="settings-section-title" data-i18n="settings.notifications">${I18n.t('settings.notifications')}</h3>
              <div class="card">
                ${Notifications.renderPreferences(prefs)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  scrollToSetting(id) {
    document.getElementById(`setting-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  },

  renderLogin() {
    const page = document.getElementById('page-login');
    if (!page) return;

    page.innerHTML = `
      <div class="auth-page">
        <div class="card auth-card animate-scale-in">
          <div class="auth-card-header">
            <h2 data-i18n="auth.login_title">${I18n.t('auth.login_title')}</h2>
            <p data-i18n="auth.login_subtitle">${I18n.t('auth.login_subtitle')}</p>
          </div>
          <form onsubmit="event.preventDefault();App.handleLogin()">
            <div class="form-group">
              <label class="form-label" data-i18n="auth.email">${I18n.t('auth.email')}</label>
              <input class="form-input" type="email" id="login-email" placeholder="${I18n.t('auth.email_placeholder')}" required>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="auth.password">${I18n.t('auth.password')}</label>
              <input class="form-input" type="password" id="login-password" placeholder="${I18n.t('auth.password_placeholder')}" required>
            </div>
            <button class="btn btn-primary btn-block btn-lg" type="submit" data-i18n="auth.login_btn">${I18n.t('auth.login_btn')}</button>
          </form>
          <div class="auth-divider" data-i18n="auth.or">${I18n.t('auth.or')}</div>
          <button class="btn btn-accent btn-block" onclick="App.handleDemoLogin()" data-i18n="auth.demo_login">${I18n.t('auth.demo_login')}</button>
          <div class="auth-footer">
            <span data-i18n="auth.no_account">${I18n.t('auth.no_account')}</span>
            <a href="#register" data-i18n="auth.register_btn">${I18n.t('nav.register')}</a>
          </div>
        </div>
      </div>
    `;
  },

  renderRegister() {
    const page = document.getElementById('page-register');
    if (!page) return;

    page.innerHTML = `
      <div class="auth-page">
        <div class="card auth-card animate-scale-in">
          <div class="auth-card-header">
            <h2 data-i18n="auth.register_title">${I18n.t('auth.register_title')}</h2>
            <p data-i18n="auth.register_subtitle">${I18n.t('auth.register_subtitle')}</p>
          </div>
          <form onsubmit="event.preventDefault();App.handleRegister()">
            <div class="form-group">
              <label class="form-label" data-i18n="auth.name">${I18n.t('auth.name')}</label>
              <input class="form-input" type="text" id="register-name" placeholder="${I18n.t('auth.name_placeholder')}" required>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="auth.email">${I18n.t('auth.email')}</label>
              <input class="form-input" type="email" id="register-email" placeholder="${I18n.t('auth.email_placeholder')}" required>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="auth.password">${I18n.t('auth.password')}</label>
              <input class="form-input" type="password" id="register-password" placeholder="${I18n.t('auth.password_placeholder')}" required>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="auth.confirm_password">${I18n.t('auth.confirm_password')}</label>
              <input class="form-input" type="password" id="register-confirm" placeholder="${I18n.t('auth.password_placeholder')}" required>
            </div>
            <button class="btn btn-primary btn-block btn-lg" type="submit" data-i18n="auth.register_btn">${I18n.t('auth.register_btn')}</button>
          </form>
          <div class="auth-footer">
            <span data-i18n="auth.has_account">${I18n.t('auth.has_account')}</span>
            <a href="#login" data-i18n="nav.login">${I18n.t('nav.login')}</a>
          </div>
        </div>
      </div>
    `;
  },

  handleLogin() {
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    const result = Auth.login(email, password);
    if (result.success) {
      Utils.showToast(I18n.t('common.success'), I18n.t('auth.login_success'), 'success');
      this.navigate('home');
    } else {
      Utils.showToast(I18n.t('common.error'), result.error, 'error');
    }
  },

  handleDemoLogin() {
    const result = Auth.demoLogin();
    if (result.success) {
      Utils.showToast(I18n.t('common.success'), I18n.t('auth.login_success'), 'success');
      this.navigate('home');
    } else {
      Utils.showToast(I18n.t('common.error'), result.error, 'error');
    }
  },

  handleRegister() {
    const name = document.getElementById('register-name')?.value;
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;
    const confirm = document.getElementById('register-confirm')?.value;

    if (!name) { Utils.showToast(I18n.t('common.error'), I18n.t('auth.name_required'), 'error'); return; }
    if (password.length < 6) { Utils.showToast(I18n.t('common.error'), I18n.t('auth.password_short'), 'error'); return; }
    if (password !== confirm) { Utils.showToast(I18n.t('common.error'), I18n.t('auth.passwords_mismatch'), 'error'); return; }

    const result = Auth.register(name, email, password);
    if (result.success) {
      Utils.showToast(I18n.t('common.success'), I18n.t('auth.register_success'), 'success');
      this.navigate('home');
    } else {
      Utils.showToast(I18n.t('common.error'), result.error, 'error');
    }
  },

  renderFooter() {
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="footer-brand">🚌 BusVoyager</div>
              <p class="footer-desc" data-i18n="footer.desc">${I18n.t('footer.desc')}</p>
            </div>
            <div>
              <div class="footer-title" data-i18n="footer.company">${I18n.t('footer.company')}</div>
              <div class="footer-links">
                <a href="#" data-i18n="footer.about">${I18n.t('footer.about')}</a>
                <a href="#" data-i18n="footer.careers">${I18n.t('footer.careers')}</a>
                <a href="#" data-i18n="footer.press">${I18n.t('footer.press')}</a>
              </div>
            </div>
            <div>
              <div class="footer-title" data-i18n="footer.support">${I18n.t('footer.support')}</div>
              <div class="footer-links">
                <a href="#" data-i18n="footer.help">${I18n.t('footer.help')}</a>
                <a href="#" data-i18n="footer.contact">${I18n.t('footer.contact')}</a>
                <a href="#" data-i18n="footer.faq">${I18n.t('footer.faq')}</a>
              </div>
            </div>
            <div>
              <div class="footer-title" data-i18n="footer.legal">${I18n.t('footer.legal')}</div>
              <div class="footer-links">
                <a href="#" data-i18n="footer.privacy">${I18n.t('footer.privacy')}</a>
                <a href="#" data-i18n="footer.terms">${I18n.t('footer.terms')}</a>
                <a href="#" data-i18n="footer.cookies">${I18n.t('footer.cookies')}</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <span data-i18n="footer.copyright">${I18n.t('footer.copyright')}</span>
            <div class="flex gap-4">
              <a href="#">Twitter</a>
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
            </div>
          </div>
        </div>
      </footer>`;
  },

  bindEvents() {
    // Mobile menu toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('mobile-nav')?.classList.toggle('open');
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
      }
    });

    // User menu dropdown
    document.getElementById('user-menu-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('user-dropdown')?.classList.toggle('open');
    });

    // Notification dropdown
    document.getElementById('notification-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById('notification-dropdown');
      dropdown?.classList.toggle('open');
      if (dropdown?.classList.contains('open')) {
        App.renderNotificationDropdown();
      }
    });

    // Language dropdown
    document.getElementById('lang-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('lang-dropdown')?.classList.toggle('open');
    });

    // Ripple effect on buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-primary, .btn-accent');
      if (btn) Utils.addRipple(e);
    });
  },

  renderNotificationDropdown() {
    const container = document.getElementById('notification-dropdown-list');
    if (!container) return;
    const notifications = Notifications.getAll().slice(0, 5);

    container.innerHTML = notifications.length === 0
      ? `<div class="text-center text-sm text-muted" style="padding:2rem">${I18n.t('notifications.no_notifications')}</div>`
      : notifications.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="Notifications.markRead('${n.id}');App.navigate('notifications')" style="padding:0.75rem;border-bottom:1px solid var(--border-light)">
          <div class="notification-body">
            <div class="notification-title" style="font-size:0.8rem">${Utils.escapeHTML(n.title)}</div>
            <div class="notification-text" style="font-size:0.7rem">${Utils.truncate(n.message, 60)}</div>
            <div class="notification-time">${Utils.timeAgo(n.createdAt)}</div>
          </div>
        </div>
      `).join('');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
