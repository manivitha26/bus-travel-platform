/* ============================================================
   AUTH — Authentication simulation
   ============================================================ */

const Auth = {
  currentUser: null,

  init() {
    this.currentUser = Utils.store.get('currentUser');
    this.updateUI();
  },

  login(email, password) {
    const users = Utils.store.get('users', []);
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, error: I18n.t('auth.invalid_email') };
    }
    if (user.password !== password) {
      return { success: false, error: I18n.t('auth.password_placeholder') };
    }
    this.currentUser = user;
    Utils.store.set('currentUser', user);
    this.updateUI();
    return { success: true };
  },

  register(name, email, password) {
    const users = Utils.store.get('users', []);
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const user = {
      id: Utils.uid(),
      name,
      email,
      password,
      avatar: null,
      bio: '',
      verified: false,
      joinedAt: new Date().toISOString(),
      completedJourneys: [],
      savedRoutes: [],
      notificationPrefs: {
        email: true,
        push: true,
        promo: false,
        reminders: true,
        community: true,
        booking: true
      }
    };
    users.push(user);
    Utils.store.set('users', users);
    this.currentUser = user;
    Utils.store.set('currentUser', user);
    this.updateUI();
    return { success: true };
  },

  demoLogin() {
    const users = Utils.store.get('users', []);
    const demoUser = users.find(u => u.email === 'demo@busvoyager.com');
    if (demoUser) {
      this.currentUser = demoUser;
      Utils.store.set('currentUser', demoUser);
      this.updateUI();
      return { success: true };
    }
    return { success: false, error: 'Demo user not found' };
  },

  logout() {
    this.currentUser = null;
    Utils.store.remove('currentUser');
    this.updateUI();
    App.navigate('home');
  },

  verifyAccount() {
    if (!this.currentUser) return;
    this.currentUser.verified = true;
    // Update in users array too
    const users = Utils.store.get('users', []);
    const idx = users.findIndex(u => u.id === this.currentUser.id);
    if (idx >= 0) {
      users[idx].verified = true;
      Utils.store.set('users', users);
    }
    Utils.store.set('currentUser', this.currentUser);
    this.updateUI();
    Utils.showToast(I18n.t('common.success'), 'Account verified!', 'success');
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  isVerified() {
    return this.currentUser && this.currentUser.verified;
  },

  updateUser(updates) {
    if (!this.currentUser) return;
    Object.assign(this.currentUser, updates);
    const users = Utils.store.get('users', []);
    const idx = users.findIndex(u => u.id === this.currentUser.id);
    if (idx >= 0) {
      Object.assign(users[idx], updates);
      Utils.store.set('users', users);
    }
    Utils.store.set('currentUser', this.currentUser);
  },

  updateUI() {
    const authBtns = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    if (this.currentUser) {
      if (authBtns) authBtns.style.display = 'none';
      if (userMenu) userMenu.style.display = 'flex';
      if (userAvatar) {
        userAvatar.innerHTML = Utils.initials(this.currentUser.name);
        userAvatar.style.background = Utils.avatarColor(this.currentUser.name);
      }
      if (userName) userName.textContent = this.currentUser.name;
    } else {
      if (authBtns) authBtns.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';
    }
  }
};
