/* ============================================================
   COMMUNITY — Posts, Comments, Likes, Forums, Moderation
   ============================================================ */

const Community = {
  currentForum: 'all',
  shareMenuOpen: null,

  init() {
    this.render();
  },

  render() {
    const page = document.getElementById('page-community');
    if (!page) return;

    page.innerHTML = `
      <div class="container page-section">
        <h1 class="mb-8 animate-fade-in" data-i18n="community.title">${I18n.t('community.title')}</h1>
        <div class="community-layout">
          <!-- Sidebar: Forums -->
          <div class="sidebar-card">
            <div class="card">
              <h5 class="mb-4" data-i18n="community.forums">${I18n.t('community.forums')}</h5>
              <div class="forum-list" id="forum-list">
                ${this.renderForumList()}
              </div>
            </div>
          </div>

          <!-- Main Feed -->
          <div class="feed-main">
            ${this.renderCreatePost()}
            <div id="posts-feed" class="stagger-children">
              ${this.renderPosts()}
            </div>
          </div>

          <!-- Right Sidebar: Trending -->
          <div class="sidebar-card">
            <div class="card">
              <h5 class="mb-4" data-i18n="community.trending">${I18n.t('community.trending')}</h5>
              <div id="trending-list">
                ${this.renderTrending()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.bindEvents();
  },

  renderForumList() {
    const forums = [
      { id: 'all', icon: '📋', name: I18n.t('community.all_posts'), color: 'var(--primary-100)' },
      { id: 'routes', icon: '🗺️', name: I18n.t('community.forum_routes'), color: 'var(--success-100)' },
      { id: 'destinations', icon: '🏖️', name: I18n.t('community.forum_destinations'), color: 'var(--accent-100)' },
      { id: 'tips', icon: '💡', name: I18n.t('community.forum_tips'), color: 'var(--warning-50)' },
      { id: 'general', icon: '💬', name: I18n.t('community.forum_general'), color: 'var(--primary-50)' }
    ];

    const posts = Utils.store.get('posts', []);
    return forums.map(f => {
      const count = f.id === 'all' ? posts.filter(p => !p.hidden).length : posts.filter(p => p.forum === f.id && !p.hidden).length;
      return `
        <div class="forum-item ${this.currentForum === f.id ? 'active' : ''}" onclick="Community.filterForum('${f.id}')">
          <div class="forum-item-icon" style="background:${f.color}">${f.icon}</div>
          <div>
            <div class="forum-item-name">${f.name}</div>
            <div class="forum-item-count">${count} posts</div>
          </div>
        </div>`;
    }).join('');
  },

  renderCreatePost() {
    if (!Auth.isLoggedIn()) return '';
    return `
      <div class="card create-post-card animate-slide-up">
        <div class="create-post-trigger" onclick="Community.openCreateModal()">
          ${Utils.avatar(Auth.currentUser.name)}
          <div class="create-post-placeholder" data-i18n="community.create_post">${I18n.t('community.create_post')}</div>
        </div>
        <div class="create-post-actions">
          <button class="btn btn-ghost btn-sm" onclick="Community.openCreateModal()">📷 <span data-i18n="community.photo_btn">${I18n.t('community.photo_btn')}</span></button>
        </div>
      </div>`;
  },

  renderPosts() {
    let posts = Utils.store.get('posts', []).filter(p => !p.hidden);
    if (this.currentForum !== 'all') {
      posts = posts.filter(p => p.forum === this.currentForum);
    }
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (posts.length === 0) {
      return `<div class="empty-state card">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-title" data-i18n="community.no_posts">${I18n.t('community.no_posts')}</div>
        <div class="empty-state-text" data-i18n="community.no_posts_desc">${I18n.t('community.no_posts_desc')}</div>
      </div>`;
    }

    return posts.map(post => this.renderPostCard(post)).join('');
  },

  renderPostCard(post) {
    const isLiked = Auth.currentUser && post.likes.includes(Auth.currentUser.id);
    const users = Utils.store.get('users', []);
    const author = users.find(u => u.id === post.userId);
    const isVerified = author && author.verified;

    return `
      <div class="card post-card animate-slide-up" id="post-${post.id}">
        <div class="card-header">
          <div class="post-author">
            ${Utils.avatar(post.userName)}
            <div class="post-author-info">
              <div class="post-author-name">
                ${Utils.escapeHTML(post.userName)}
                ${isVerified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}
              </div>
              <div class="post-time">${Utils.timeAgo(post.createdAt)}</div>
            </div>
          </div>
          ${Auth.isLoggedIn() && post.userId !== Auth.currentUser?.id ? `
            <button class="btn btn-ghost btn-icon" onclick="Community.openReportModal('${post.id}')" title="${I18n.t('community.report')}">🚩</button>
          ` : ''}
        </div>

        <div class="post-content">${Utils.escapeHTML(post.content)}</div>
        ${post.image ? `<img class="post-image" src="${post.image}" alt="Post image">` : ''}

        <div class="card-footer">
          <div class="post-actions">
            <button class="post-action-btn ${isLiked ? 'liked' : ''}" onclick="Community.toggleLike('${post.id}')">
              ${isLiked ? '❤️' : '🤍'} <span>${post.likes.length}</span>
            </button>
            <button class="post-action-btn" onclick="Community.toggleComments('${post.id}')">
              💬 <span>${post.comments.length}</span>
            </button>
            <div class="relative">
              <button class="post-action-btn" onclick="Community.toggleShareMenu('${post.id}')">
                🔗 <span data-i18n="community.share">${I18n.t('community.share')}</span>
              </button>
              <div class="dropdown-menu ${this.shareMenuOpen === post.id ? 'open' : ''}" id="share-menu-${post.id}">
                <div class="dropdown-item" onclick="Community.sharePost('${post.id}','twitter')">🐦 ${I18n.t('community.share_twitter')}</div>
                <div class="dropdown-item" onclick="Community.sharePost('${post.id}','facebook')">📘 ${I18n.t('community.share_facebook')}</div>
                <div class="dropdown-item" onclick="Community.sharePost('${post.id}','whatsapp')">💬 ${I18n.t('community.share_whatsapp')}</div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" onclick="Community.copyLink('${post.id}')">📋 ${I18n.t('community.copy_link')}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="comments-section hidden" id="comments-${post.id}">
          ${post.comments.map(c => `
            <div class="comment animate-slide-up">
              ${Utils.avatar(c.userName, 'sm')}
              <div class="comment-body">
                <div class="comment-author">${Utils.escapeHTML(c.userName)}</div>
                <div class="comment-text">${Utils.escapeHTML(c.text)}</div>
                <div class="comment-meta">${Utils.timeAgo(c.createdAt)}</div>
              </div>
            </div>
          `).join('')}
          ${Auth.isLoggedIn() ? `
            <div class="comment-input-row">
              ${Utils.avatar(Auth.currentUser.name, 'sm')}
              <input class="form-input" placeholder="${I18n.t('community.write_comment')}" id="comment-input-${post.id}" onkeypress="if(event.key==='Enter')Community.addComment('${post.id}')">
              <button class="btn btn-primary btn-sm" onclick="Community.addComment('${post.id}')">→</button>
            </div>` : ''}
        </div>
      </div>`;
  },

  renderTrending() {
    const posts = Utils.store.get('posts', []).filter(p => !p.hidden);
    const trending = posts.sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length)).slice(0, 5);

    return trending.map((post, i) => `
      <div class="trending-item" onclick="Community.scrollToPost('${post.id}')">
        <span class="trending-rank">${i + 1}</span>
        <div>
          <div class="trending-title">${Utils.truncate(post.content, 50)}</div>
          <div class="trending-meta">❤️ ${post.likes.length} · 💬 ${post.comments.length}</div>
        </div>
      </div>
    `).join('');
  },

  filterForum(forum) {
    this.currentForum = forum;
    this.render();
  },

  toggleLike(postId) {
    if (!Auth.isLoggedIn()) {
      Utils.showToast(I18n.t('common.warning'), 'Please log in to like posts', 'warning');
      return;
    }
    const posts = Utils.store.get('posts', []);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const idx = post.likes.indexOf(Auth.currentUser.id);
    if (idx >= 0) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(Auth.currentUser.id);
    }
    Utils.store.set('posts', posts);

    // Update just the post card
    const card = document.getElementById(`post-${postId}`);
    if (card) {
      const btn = card.querySelector('.post-action-btn');
      if (btn) {
        const isLiked = post.likes.includes(Auth.currentUser.id);
        btn.className = `post-action-btn ${isLiked ? 'liked' : ''}`;
        btn.innerHTML = `${isLiked ? '❤️' : '🤍'} <span>${post.likes.length}</span>`;
        if (isLiked) btn.classList.add('heart-animate');
      }
    }
  },

  toggleComments(postId) {
    const section = document.getElementById(`comments-${postId}`);
    if (section) section.classList.toggle('hidden');
  },

  addComment(postId) {
    if (!Auth.isLoggedIn()) return;
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input || !input.value.trim()) return;

    const posts = Utils.store.get('posts', []);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    post.comments.push({
      id: Utils.uid(),
      userId: Auth.currentUser.id,
      userName: Auth.currentUser.name,
      text: input.value.trim(),
      createdAt: new Date().toISOString()
    });
    Utils.store.set('posts', posts);
    this.render();
    // Re-open the comments
    const section = document.getElementById(`comments-${postId}`);
    if (section) section.classList.remove('hidden');
  },

  toggleShareMenu(postId) {
    this.shareMenuOpen = this.shareMenuOpen === postId ? null : postId;
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    if (this.shareMenuOpen) {
      const menu = document.getElementById(`share-menu-${postId}`);
      if (menu) menu.classList.add('open');
    }
  },

  sharePost(postId, platform) {
    const posts = Utils.store.get('posts', []);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const text = encodeURIComponent(Utils.truncate(post.content, 200));
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';

    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
    }

    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
    this.shareMenuOpen = null;
  },

  copyLink(postId) {
    navigator.clipboard?.writeText(window.location.href + '#post-' + postId);
    Utils.showToast(I18n.t('common.success'), I18n.t('community.link_copied'), 'success');
    this.shareMenuOpen = null;
  },

  openCreateModal() {
    if (!Auth.isVerified()) {
      Utils.showToast(I18n.t('common.warning'), I18n.t('community.verified_only'), 'warning');
      return;
    }
    Utils.openModal('modal-create-post');
  },

  submitPost() {
    if (!Auth.isVerified()) return;
    const content = document.getElementById('new-post-content')?.value?.trim();
    const forum = document.getElementById('new-post-forum')?.value || 'general';

    if (!content) return;

    const posts = Utils.store.get('posts', []);
    posts.unshift({
      id: Utils.uid(),
      userId: Auth.currentUser.id,
      userName: Auth.currentUser.name,
      content,
      image: null,
      forum,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      reports: [],
      hidden: false
    });
    Utils.store.set('posts', posts);

    Utils.closeModal('modal-create-post');
    document.getElementById('new-post-content').value = '';
    this.render();
    Utils.showToast(I18n.t('common.success'), 'Post published!', 'success');
  },

  openReportModal(postId) {
    this._reportingPostId = postId;
    Utils.openModal('modal-report');
  },

  submitReport() {
    const reason = document.getElementById('report-reason')?.value;
    if (!reason || !this._reportingPostId) return;

    const posts = Utils.store.get('posts', []);
    const post = posts.find(p => p.id === this._reportingPostId);
    if (post) {
      post.reports.push({
        userId: Auth.currentUser?.id,
        reason,
        createdAt: new Date().toISOString()
      });
      // Auto-hide after 3 reports
      if (post.reports.length >= 3) post.hidden = true;
      Utils.store.set('posts', posts);
    }

    Utils.closeModal('modal-report');
    Utils.showToast(I18n.t('common.info'), I18n.t('community.report_success'), 'info');
    this.render();
  },

  scrollToPost(postId) {
    const el = document.getElementById(`post-${postId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  bindEvents() {
    // Close share menus on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.relative')) {
        this.shareMenuOpen = null;
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
      }
    });
  }
};
