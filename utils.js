/* ============================================================
   UTILS — Shared utility functions
   ============================================================ */

const Utils = {
  // Generate unique ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // Relative time (e.g., "2 hours ago")
  timeAgo(date) {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now - d) / 1000);
    if (seconds < 60) return I18n.t('common.just_now');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${I18n.t('common.minutes')} ${I18n.t('common.ago')}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${I18n.t('common.hours')} ${I18n.t('common.ago')}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ${I18n.t('common.days')} ${I18n.t('common.ago')}`;
    const weeks = Math.floor(days / 7);
    return `${weeks} ${I18n.t('common.weeks')} ${I18n.t('common.ago')}`;
  },

  // Format date
  formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  },

  // Truncate text
  truncate(str, len = 100) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  },

  // Generate avatar color from name
  avatarColor(name) {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
      '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  },

  // Get initials
  initials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
  },

  // Create avatar HTML
  avatar(name, size = '') {
    const cls = size ? `avatar avatar-${size}` : 'avatar';
    return `<div class="${cls}" style="background:${this.avatarColor(name)}">${this.initials(name)}</div>`;
  },

  // Stars HTML display
  starsHTML(rating, max = 5) {
    let html = '<div class="stars-display">';
    for (let i = 1; i <= max; i++) {
      html += i <= Math.round(rating) ? '<span>★</span>' : '<span class="star-empty">★</span>';
    }
    html += '</div>';
    return html;
  },

  // Star rating input widget
  starRatingInput(name = 'rating') {
    let html = '<div class="star-rating">';
    for (let i = 5; i >= 1; i--) {
      html += `<input type="radio" name="${name}" value="${i}" id="${name}-${i}">`;
      html += `<label for="${name}-${i}">★</label>`;
    }
    html += '</div>';
    return html;
  },

  // Toast notification
  showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in-right`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
      <div class="toast-progress"></div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Modal open/close
  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Local storage helpers
  store: {
    get(key, fallback = null) {
      try {
        const val = localStorage.getItem('bv_' + key);
        return val ? JSON.parse(val) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('bv_' + key, JSON.stringify(value)); } catch {}
    },
    remove(key) {
      try { localStorage.removeItem('bv_' + key); } catch {}
    }
  },

  // Escape HTML
  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Add ripple effect to button
  addRipple(e) {
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
};
