/* ============================================================
   REVIEWS — Ratings & Reviews System
   ============================================================ */

const Reviews = {
  selectedRouteId: null,
  sortBy: 'recent',
  filterStars: 0,

  init() {
    this.render();
  },

  render() {
    const page = document.getElementById('page-reviews');
    if (!page) return;

    const routes = Utils.store.get('routes', []);

    page.innerHTML = `
      <div class="container page-section">
        <h1 class="mb-8 animate-fade-in" data-i18n="reviews.title">${I18n.t('reviews.title')}</h1>

        <!-- Route Selector -->
        <div class="card mb-6 animate-slide-up">
          <h5 class="mb-3">Select a Route</h5>
          <div class="grid grid-3 gap-3" id="route-selector">
            ${routes.map(r => `
              <div class="route-option ${this.selectedRouteId === r.id ? 'selected' : ''}" onclick="Reviews.selectRoute('${r.id}')" style="padding:var(--space-3)">
                <div class="font-semibold text-sm">${Utils.escapeHTML(r.name)}</div>
                <div class="text-xs text-muted mt-1">${Utils.escapeHTML(r.from)} → ${Utils.escapeHTML(r.to)}</div>
                <div class="flex items-center gap-2 mt-2">
                  ${Utils.starsHTML(this.getAvgRating(r.id))}
                  <span class="text-xs text-muted">(${this.getRouteReviews(r.id).length})</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Reviews Section (shown when route selected) -->
        <div id="reviews-detail" style="display:${this.selectedRouteId ? 'block' : 'none'}">
          ${this.selectedRouteId ? this.renderRouteReviews() : ''}
        </div>
      </div>
    `;
  },

  selectRoute(routeId) {
    this.selectedRouteId = routeId;
    this.sortBy = 'recent';
    this.filterStars = 0;
    this.render();
  },

  getRouteReviews(routeId) {
    return Utils.store.get('reviews', []).filter(r => r.routeId === routeId && !r.hidden);
  },

  getAvgRating(routeId) {
    const reviews = this.getRouteReviews(routeId);
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  },

  getRatingDistribution(routeId) {
    const reviews = this.getRouteReviews(routeId);
    const dist = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach(r => dist[r.rating - 1]++);
    return dist;
  },

  renderRouteReviews() {
    const route = Utils.store.get('routes', []).find(r => r.id === this.selectedRouteId);
    if (!route) return '';

    let reviews = this.getRouteReviews(this.selectedRouteId);
    const avg = this.getAvgRating(this.selectedRouteId);
    const dist = this.getRatingDistribution(this.selectedRouteId);
    const total = reviews.length;

    // Apply filters
    if (this.filterStars > 0) {
      reviews = reviews.filter(r => r.rating === this.filterStars);
    }

    // Apply sort
    switch (this.sortBy) {
      case 'helpful': reviews.sort((a, b) => b.upvotes.length - a.upvotes.length); break;
      case 'highest': reviews.sort((a, b) => b.rating - a.rating); break;
      case 'lowest': reviews.sort((a, b) => a.rating - b.rating); break;
      default: reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return `
      <!-- Rating Summary -->
      <div class="route-detail-header animate-slide-up">
        <div class="route-rating-summary">
          <div class="rating-big-number">${avg.toFixed(1)}</div>
          ${Utils.starsHTML(avg)}
          <div class="rating-count">${total} ${I18n.t('reviews.total_reviews')}</div>
        </div>
        <div class="rating-bars">
          ${[5, 4, 3, 2, 1].map(star => {
            const count = dist[star - 1];
            const pct = total > 0 ? (count / total * 100) : 0;
            return `
              <div class="rating-bar-row" onclick="Reviews.filterByStar(${star})" style="cursor:pointer">
                <span class="rating-bar-label">${star}★</span>
                <div class="rating-bar-track"><div class="rating-bar-fill" style="width:${pct}%"></div></div>
                <span class="rating-bar-count">${count}</span>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Write Review Button -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex gap-2">
          <select class="form-select" style="width:auto;padding:0.4rem 0.75rem;font-size:0.8rem" onchange="Reviews.sortBy=this.value;Reviews.render()">
            <option value="recent" ${this.sortBy === 'recent' ? 'selected' : ''}>${I18n.t('reviews.sort_recent')}</option>
            <option value="helpful" ${this.sortBy === 'helpful' ? 'selected' : ''}>${I18n.t('reviews.sort_helpful')}</option>
            <option value="highest" ${this.sortBy === 'highest' ? 'selected' : ''}>${I18n.t('reviews.sort_highest')}</option>
            <option value="lowest" ${this.sortBy === 'lowest' ? 'selected' : ''}>${I18n.t('reviews.sort_lowest')}</option>
          </select>
          ${this.filterStars > 0 ? `<button class="btn btn-ghost btn-sm" onclick="Reviews.filterByStar(0)">✕ Clear filter</button>` : ''}
        </div>
        ${Auth.isVerified() ? `
          <button class="btn btn-primary" onclick="Reviews.openWriteReview()">
            ✍️ <span data-i18n="reviews.write_review">${I18n.t('reviews.write_review')}</span>
          </button>` : Auth.isLoggedIn() ? `
          <div class="text-sm text-muted">${I18n.t('reviews.must_verify')}</div>` : `
          <div class="text-sm text-muted">${I18n.t('reviews.must_complete')}</div>`}
      </div>

      <!-- Reviews List -->
      <div class="stagger-children">
        ${reviews.length === 0 ? `
          <div class="empty-state card">
            <div class="empty-state-icon">⭐</div>
            <div class="empty-state-title">${I18n.t('reviews.no_reviews')}</div>
            <div class="empty-state-text">${I18n.t('reviews.no_reviews_desc')}</div>
          </div>` : reviews.map(r => this.renderReviewCard(r)).join('')}
      </div>`;
  },

  renderReviewCard(review) {
    const users = Utils.store.get('users', []);
    const author = users.find(u => u.id === review.userId);
    const isVerified = author && author.verified;
    const isTrusted = review.upvotes.length >= 3;
    const isOwn = Auth.currentUser && Auth.currentUser.id === review.userId;
    const canEdit = isOwn && (Date.now() - new Date(review.createdAt).getTime()) < 86400000;
    const hasUpvoted = Auth.currentUser && review.upvotes.includes(Auth.currentUser.id);

    return `
      <div class="card review-card animate-slide-up">
        <div class="review-header">
          <div class="review-author">
            ${Utils.avatar(review.userName)}
            <div>
              <div class="review-author-name">
                ${Utils.escapeHTML(review.userName)}
                ${isVerified ? '<span class="verified-badge">✓</span>' : ''}
                ${isTrusted ? `<span class="trusted-reviewer-badge">⭐ ${I18n.t('reviews.trusted_reviewer')}</span>` : ''}
              </div>
              <div class="review-date">${Utils.formatDate(review.createdAt)}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${Utils.starsHTML(review.rating)}
            <span class="badge badge-success"><span>✓</span> ${I18n.t('reviews.verified_purchase')}</span>
          </div>
        </div>

        <div class="review-text">${Utils.escapeHTML(review.text)}</div>

        <div class="review-helpful">
          <button class="review-helpful-btn ${hasUpvoted ? 'active' : ''}" onclick="Reviews.toggleUpvote('${review.id}')">
            👍 ${I18n.t('reviews.helpful')} (${review.upvotes.length})
          </button>
          <button class="review-helpful-btn" onclick="Reviews.toggleDownvote('${review.id}')">
            👎 (${review.downvotes.length})
          </button>
          ${isOwn && canEdit ? `<button class="btn btn-ghost btn-sm" onclick="Reviews.editReview('${review.id}')">✏️ ${I18n.t('reviews.edit')}</button>` : ''}
          ${isOwn && !canEdit && review.edited === false ? `<span class="text-xs text-muted">${I18n.t('reviews.edit_expired')}</span>` : ''}
          ${!isOwn && Auth.isLoggedIn() ? `<button class="btn btn-ghost btn-sm" onclick="Reviews.reportReview('${review.id}')">🚩</button>` : ''}
        </div>
      </div>`;
  },

  filterByStar(star) {
    this.filterStars = this.filterStars === star ? 0 : star;
    this.render();
  },

  toggleUpvote(reviewId) {
    if (!Auth.isLoggedIn()) return;
    const reviews = Utils.store.get('reviews', []);
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const idx = review.upvotes.indexOf(Auth.currentUser.id);
    if (idx >= 0) {
      review.upvotes.splice(idx, 1);
    } else {
      review.upvotes.push(Auth.currentUser.id);
      // Remove from downvotes if present
      const dIdx = review.downvotes.indexOf(Auth.currentUser.id);
      if (dIdx >= 0) review.downvotes.splice(dIdx, 1);
    }
    Utils.store.set('reviews', reviews);
    this.render();
  },

  toggleDownvote(reviewId) {
    if (!Auth.isLoggedIn()) return;
    const reviews = Utils.store.get('reviews', []);
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const idx = review.downvotes.indexOf(Auth.currentUser.id);
    if (idx >= 0) {
      review.downvotes.splice(idx, 1);
    } else {
      review.downvotes.push(Auth.currentUser.id);
      const uIdx = review.upvotes.indexOf(Auth.currentUser.id);
      if (uIdx >= 0) review.upvotes.splice(uIdx, 1);
    }
    Utils.store.set('reviews', reviews);
    this.render();
  },

  openWriteReview() {
    if (!Auth.isVerified()) {
      Utils.showToast(I18n.t('common.warning'), I18n.t('reviews.must_verify'), 'warning');
      return;
    }
    // Check if user has completed a journey on this route
    const bookings = Utils.store.get('bookings', []);
    const completed = bookings.find(b => b.routeId === this.selectedRouteId && b.userId === Auth.currentUser.id && b.status === 'completed');

    if (!completed) {
      Utils.showToast(I18n.t('common.warning'), I18n.t('reviews.must_complete'), 'warning');
      return;
    }

    // Check if already reviewed this route for this journey
    const reviews = Utils.store.get('reviews', []);
    const existing = reviews.find(r => r.routeId === this.selectedRouteId && r.userId === Auth.currentUser.id);
    if (existing) {
      Utils.showToast(I18n.t('common.warning'), I18n.t('reviews.already_reviewed'), 'warning');
      return;
    }

    Utils.openModal('modal-write-review');
  },

  submitReview() {
    const ratingInput = document.querySelector('#modal-write-review input[name="rating"]:checked');
    const textInput = document.getElementById('review-text-input');

    if (!ratingInput) {
      Utils.showToast(I18n.t('common.warning'), 'Please select a rating', 'warning');
      return;
    }
    if (!textInput || textInput.value.trim().length < 50) {
      Utils.showToast(I18n.t('common.warning'), I18n.t('reviews.min_chars'), 'warning');
      return;
    }

    const reviews = Utils.store.get('reviews', []);
    reviews.push({
      id: Utils.uid(),
      routeId: this.selectedRouteId,
      userId: Auth.currentUser.id,
      userName: Auth.currentUser.name,
      rating: parseInt(ratingInput.value),
      text: textInput.value.trim(),
      createdAt: new Date().toISOString(),
      upvotes: [],
      downvotes: [],
      reports: [],
      hidden: false,
      journeyId: Utils.uid(),
      edited: false
    });
    Utils.store.set('reviews', reviews);

    Utils.closeModal('modal-write-review');
    Utils.showToast(I18n.t('common.success'), 'Review submitted!', 'success');
    this.render();
  },

  editReview(reviewId) {
    const reviews = Utils.store.get('reviews', []);
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    // Check 24-hour window
    if (Date.now() - new Date(review.createdAt).getTime() > 86400000) {
      Utils.showToast(I18n.t('common.warning'), I18n.t('reviews.edit_expired'), 'warning');
      return;
    }

    const newText = prompt('Edit your review:', review.text);
    if (newText && newText.trim().length >= 50) {
      review.text = newText.trim();
      review.edited = true;
      Utils.store.set('reviews', reviews);
      this.render();
      Utils.showToast(I18n.t('common.success'), 'Review updated!', 'success');
    } else if (newText) {
      Utils.showToast(I18n.t('common.warning'), I18n.t('reviews.min_chars'), 'warning');
    }
  },

  reportReview(reviewId) {
    const reviews = Utils.store.get('reviews', []);
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    review.reports.push({
      userId: Auth.currentUser?.id,
      createdAt: new Date().toISOString()
    });

    // Auto-hide after 3 reports, exclude from avg
    if (review.reports.length >= 3) review.hidden = true;

    Utils.store.set('reviews', reviews);
    Utils.showToast(I18n.t('common.info'), I18n.t('reviews.review_reported'), 'info');
    this.render();
  }
};
