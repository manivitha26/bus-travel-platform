/* ============================================================
   NOTIFICATIONS — Real-time notification system
   ============================================================ */

const Notifications = {
  pollingInterval: null,

  init() {
    this.updateBadge();
    // Simulate real-time by polling
    this.pollingInterval = setInterval(() => this.simulateIncoming(), 45000);
  },

  getAll() {
    if (!Auth.isLoggedIn()) return [];
    return Utils.store.get('notifications', [])
      .filter(n => n.userId === Auth.currentUser.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUnreadCount() {
    return this.getAll().filter(n => !n.read).length;
  },

  updateBadge() {
    const badge = document.getElementById('notification-badge');
    const count = this.getUnreadCount();
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = 'flex';
        badge.classList.add('badge-animate');
      } else {
        badge.style.display = 'none';
      }
    }
  },

  markAllRead() {
    const all = Utils.store.get('notifications', []);
    all.forEach(n => {
      if (Auth.currentUser && n.userId === Auth.currentUser.id) n.read = true;
    });
    Utils.store.set('notifications', all);
    this.updateBadge();
    this.render();
  },

  markRead(id) {
    const all = Utils.store.get('notifications', []);
    const notif = all.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      Utils.store.set('notifications', all);
      this.updateBadge();
    }
  },

  retryFailed(id) {
    const all = Utils.store.get('notifications', []);
    const notif = all.find(n => n.id === id);
    if (notif) {
      notif.status = 'delivered';
      notif.retryCount = (notif.retryCount || 0) + 1;
      Utils.store.set('notifications', all);
      Utils.showToast(I18n.t('common.success'), 'Notification resent', 'success');
      this.render();
    }
  },

  addNotification(type, title, message, channel = 'in_app') {
    if (!Auth.isLoggedIn()) return;
    const all = Utils.store.get('notifications', []);
    all.unshift({
      id: Utils.uid(),
      userId: Auth.currentUser.id,
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      channel,
      status: 'delivered'
    });
    Utils.store.set('notifications', all);
    this.updateBadge();

    // Show toast for in-app notifications
    if (channel === 'in_app' || channel === 'push') {
      Utils.showToast(title, message, 'info');
    }
  },

  simulateIncoming() {
    if (!Auth.isLoggedIn()) return;
    const types = [
      { type: 'community_update', title: 'New activity', message: 'Someone liked your post in the community!' },
      { type: 'promo', title: '🎁 Flash Sale!', message: 'Limited time: 15% off express routes. Book now!' },
      { type: 'reminder', title: 'Route Update', message: 'Your saved route has a new schedule update.' }
    ];
    const prefs = Auth.currentUser.notificationPrefs || {};
    const filtered = types.filter(t => {
      if (t.type === 'promo' && !prefs.promo) return false;
      if (t.type === 'community_update' && !prefs.community) return false;
      return true;
    });
    if (filtered.length === 0) return;
    // 30% chance to send
    if (Math.random() > 0.3) return;
    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    this.addNotification(chosen.type, chosen.title, chosen.message, 'in_app');
  },

  getPrefs() {
    if (!Auth.currentUser) return {};
    return Auth.currentUser.notificationPrefs || {
      email: true, push: true, promo: false, reminders: true, community: true, booking: true
    };
  },

  savePrefs(prefs) {
    Auth.updateUser({ notificationPrefs: prefs });
    Utils.showToast(I18n.t('common.success'), I18n.t('notifications.pref_saved'), 'success');
  },

  render() {
    const page = document.getElementById('page-notifications');
    if (!page) return;

    const notifications = this.getAll();
    const prefs = this.getPrefs();

    page.innerHTML = `
      <div class="container page-section">
        <div class="flex justify-between items-center mb-8 animate-fade-in">
          <h1 data-i18n="notifications.title">${I18n.t('notifications.title')}</h1>
          <button class="btn btn-secondary" onclick="Notifications.markAllRead()">
            ✓ <span data-i18n="notifications.mark_all_read">${I18n.t('notifications.mark_all_read')}</span>
          </button>
        </div>

        <div class="notifications-layout">
          <!-- Preferences Sidebar -->
          <div class="sidebar-card">
            <div class="card">
              <h5 class="mb-4" data-i18n="notifications.preferences">${I18n.t('notifications.preferences')}</h5>
              ${this.renderPreferences(prefs)}
            </div>
          </div>

          <!-- Notification List -->
          <div>
            <div class="tabs mb-6">
              <div class="tab active" onclick="Notifications.filterType('all')" data-i18n="community.all_posts">All</div>
              <div class="tab" onclick="Notifications.filterType('unread')">Unread (${notifications.filter(n=>!n.read).length})</div>
              <div class="tab" onclick="Notifications.filterType('booking')" data-i18n="notifications.enable_booking">${I18n.t('notifications.enable_booking')}</div>
              <div class="tab" onclick="Notifications.filterType('community')" data-i18n="notifications.enable_community">${I18n.t('notifications.enable_community')}</div>
            </div>
            <div id="notification-list" class="stagger-children">
              ${notifications.length === 0 ? `
                <div class="empty-state">
                  <div class="empty-state-icon">🔔</div>
                  <div class="empty-state-title" data-i18n="notifications.no_notifications">${I18n.t('notifications.no_notifications')}</div>
                  <div class="empty-state-text" data-i18n="notifications.no_notifications_desc">${I18n.t('notifications.no_notifications_desc')}</div>
                </div>` : notifications.map(n => this.renderNotification(n)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderNotification(n) {
    const icons = {
      booking_confirmed: { icon: '✅', bg: 'var(--success-100)', color: 'var(--success-600)' },
      booking_cancelled: { icon: '❌', bg: 'var(--danger-100)', color: 'var(--danger-600)' },
      schedule_change: { icon: '📋', bg: 'var(--warning-50)', color: 'var(--warning-600)' },
      reminder: { icon: '⏰', bg: 'var(--primary-100)', color: 'var(--primary-600)' },
      promo: { icon: '🎁', bg: 'var(--accent-100)', color: 'var(--accent-600)' },
      community_update: { icon: '👥', bg: 'var(--primary-100)', color: 'var(--primary-600)' }
    };
    const style = icons[n.type] || icons.reminder;

    const channelIcons = { email: '📧', push: '📱', in_app: '🔔' };
    const statusColors = { delivered: 'var(--success-600)', failed: 'var(--danger-600)', pending: 'var(--warning-600)' };

    return `
      <div class="notification-item ${n.read ? '' : 'unread'} animate-slide-up" onclick="Notifications.markRead('${n.id}')">
        <div class="notification-icon-wrap" style="background:${style.bg};color:${style.color}">
          ${style.icon}
        </div>
        <div class="notification-body">
          <div class="notification-title">${Utils.escapeHTML(n.title)}</div>
          <div class="notification-text">${Utils.escapeHTML(n.message)}</div>
          <div class="flex items-center gap-4 mt-2">
            <div class="notification-time">${Utils.timeAgo(n.createdAt)}</div>
            <div class="notification-status" style="color:${statusColors[n.status] || statusColors.pending}">
              ${channelIcons[n.channel] || '🔔'} ${n.status}
              ${n.status === 'failed' ? `<button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:0.7rem" onclick="event.stopPropagation();Notifications.retryFailed('${n.id}')">${I18n.t('notifications.retry')}</button>` : ''}
            </div>
          </div>
        </div>
      </div>`;
  },

  renderPreferences(prefs) {
    const items = [
      { key: 'email', label: I18n.t('notifications.enable_email'), desc: I18n.t('notifications.email') },
      { key: 'push', label: I18n.t('notifications.enable_push'), desc: I18n.t('notifications.push') },
      { key: 'booking', label: I18n.t('notifications.enable_booking'), desc: '' },
      { key: 'reminders', label: I18n.t('notifications.enable_reminders'), desc: '' },
      { key: 'community', label: I18n.t('notifications.enable_community'), desc: '' },
      { key: 'promo', label: I18n.t('notifications.enable_promo'), desc: '' }
    ];

    return items.map(item => `
      <div class="preference-row" style="padding:0.75rem 0">
        <div class="preference-info">
          <div class="preference-label">${item.label}</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${prefs[item.key] ? 'checked' : ''} onchange="Notifications.togglePref('${item.key}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    `).join('');
  },

  togglePref(key, value) {
    const prefs = this.getPrefs();
    prefs[key] = value;
    this.savePrefs(prefs);
  },

  filterType(type) {
    // Update active tab
    document.querySelectorAll('#page-notifications .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    let notifications = this.getAll();
    if (type === 'unread') notifications = notifications.filter(n => !n.read);
    else if (type === 'booking') notifications = notifications.filter(n => n.type.includes('booking'));
    else if (type === 'community') notifications = notifications.filter(n => n.type === 'community_update');

    const list = document.getElementById('notification-list');
    if (list) {
      list.innerHTML = notifications.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-title">${I18n.t('notifications.no_notifications')}</div></div>`
        : notifications.map(n => this.renderNotification(n)).join('');
    }
  },

  destroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }
};
