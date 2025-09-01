document.addEventListener('DOMContentLoaded', function () {
  console.log('Waiting for app initialization...');

  const waitForApp = setInterval(() => {
    if (window.app && typeof window.app.init === 'function') {
      clearInterval(waitForApp);
      setupAuthModule();
    }
  }, 50);
});

function setupAuthModule() {
  console.log('Auth module initialized');

  const API_URL = window.CONFIG.API_URL + "/auth";

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const loginContainer = document.getElementById('login-container');
  const registerContainer = document.getElementById('register-container');

  if (!loginForm || !registerForm) {
    console.error('Critical authentication elements missing from DOM');
    return;
  }

  // LOGIN
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = this.elements.email.value.trim();
    const password = this.elements.password.value.trim();

    if (!validateCredentials(email, password)) return;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      handleAuthSuccess(data);
    } catch (err) {
      showAuthError(err.message);
    }
  });

  // REGISTER
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = this.elements.name.value.trim();
    const email = this.elements.email.value.trim();
    const password = this.elements.password.value.trim();
    const confirmPassword = this.elements.confirmPassword.value.trim();

    if (!validateRegistration(name, email, password, confirmPassword)) return;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      // Show success message and switch to login
      showAuthSuccess("User successfully created! Please login with your credentials.");
      loginContainer.style.display = 'block';
      registerContainer.style.display = 'none';
    } catch (err) {
      showAuthError(err.message);
    }
  });

  function handleAuthSuccess(data) {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("token", data.token || "");
    localStorage.setItem("username", data.user.name);
    localStorage.setItem("email", data.user.email);

    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app').classList.add('active');

    window.app.init();
  }

  function showAuthError(message) {
    const errorElement = document.getElementById('auth-error') || createErrorElement();
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => errorElement.style.display = 'none', 5000);
  }

  function showAuthSuccess(message) {
    const successElement = document.getElementById('auth-success') || createSuccessElement();
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => successElement.style.display = 'none', 5000);
  }

  function createErrorElement() {
    const div = document.createElement('div');
    div.id = 'auth-error';
    div.style.cssText = `
      display: none;
      color: #dc3545;
      background-color: #f8d7da;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    `;
    const activeContainer = registerContainer.style.display === 'block' ? registerContainer : loginContainer;
    activeContainer.prepend(div);
    return div;
  }

  function createSuccessElement() {
    const div = document.createElement('div');
    div.id = 'auth-success';
    div.style.cssText = `
      display: none;
      color: #155724;
      background-color: #d4edda;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    `;
    const activeContainer = registerContainer.style.display === 'block' ? registerContainer : loginContainer;
    activeContainer.prepend(div);
    return div;
  }

  // Validators
  function validateCredentials(email, password) {
    if (!email || !password) {
      showAuthError('Please enter both email and password');
      return false;
    }
    return true;
  }

  function validateRegistration(name, email, password, confirmPassword) {
    if (!name || !email || !password || !confirmPassword) {
      showAuthError('Please fill in all fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAuthError('Please enter a valid email address');
      return false;
    }
    if (password !== confirmPassword) {
      showAuthError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      showAuthError('Password must be at least 6 characters');
      return false;
    }
    return true;
  }

  // Toggle views
  if (showRegister && showLogin && loginContainer && registerContainer) {
    showRegister.addEventListener('click', () => {
      loginContainer.style.display = 'none';
      registerContainer.style.display = 'block';
    });

    showLogin.addEventListener('click', () => {
      registerContainer.style.display = 'none';
      loginContainer.style.display = 'block';
    });
  }

  // Logout
  document.addEventListener('click', e => {
    if (e.target.closest('#logout-btn')) {
      e.preventDefault();
      handleLogout();
    }
  });

  function handleLogout() {
    const darkMode = localStorage.getItem('darkMode');
    const notifications = localStorage.getItem('notificationsEnabled');

    localStorage.clear();

    if (darkMode) localStorage.setItem('darkMode', darkMode);
    if (notifications) localStorage.setItem('notificationsEnabled', notifications);

    document.getElementById('app').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
  }

  // Google Sign-In
  const googleSignInBtn = document.getElementById('google-signin-btn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
  }

  function handleGoogleSignIn() {
    // Load Google Sign-In library dynamically
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);
  }

  function initializeGoogleSignIn() {
    if (!window.google) {
      console.error('Google Sign-In library failed to load');
      showAuthError('Google Sign-In failed to initialize');
      return;
    }

    // For now, we'll use a placeholder client ID
    // In production, this should be set in your environment variables
    const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual client ID
    
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleSignInCallback
    });

    google.accounts.id.prompt(); // Display the One Tap dialog
  }

  function handleGoogleSignInCallback(response) {
    if (response.error) {
      console.error('Google Sign-In error:', response.error);
      showAuthError('Google Sign-In failed: ' + response.error);
      return;
    }

    // Send the ID token to our backend
    authenticateWithGoogle(response.credential);
  }

  async function authenticateWithGoogle(idToken) {
    try {
      const res = await fetch(`${API_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google authentication failed");
      
      // Handle successful Google authentication
      handleAuthSuccess({
        ...data,
        user: data.user,
        token: idToken // Use Google ID token as auth token
      });
      
    } catch (err) {
      showAuthError(err.message);
    }
  }
}
