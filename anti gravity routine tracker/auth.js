/* ═══════════════════════════════════════════
   ANTI-GRAVITY — Auth Logic
   Shared by login.html & signup.html
   Uses localStorage for demo authentication
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    // ── Particles ──────────────────────────
    const particleContainer = document.getElementById('particles');
    if (particleContainer) {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 4 + 1.5;
            const x = Math.random() * 100;
            const dur = Math.random() * 18 + 12;
            const delay = Math.random() * 20;
            const drift = (Math.random() - 0.5) * 60;
            const hue = Math.random() > 0.5 ? '180, 100%, 50%' : '290, 100%, 50%';
            const opacity = Math.random() * 0.35 + 0.1;
            p.style.cssText = `width:${size}px;height:${size}px;left:${x}%;background:hsla(${hue},${opacity});box-shadow:0 0 ${size * 2}px hsla(${hue},${opacity * 0.6});animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px;`;
            particleContainer.appendChild(p);
        }
    }

    // ── Toast ──────────────────────────────
    function showToast(msg, type = 'success') {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.className = `toast ${type}`;
        void toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ── Password Toggle ───────────────────
    const toggleBtn = document.getElementById('toggle-pw');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const input = toggleBtn.closest('.input-wrap').querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
            } else {
                input.type = 'password';
                toggleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
            }
        });
    }

    // ── Password Strength ─────────────────
    const pwInput = document.getElementById('signup-password');
    const pwFill = document.getElementById('pw-fill');
    const pwLabel = document.getElementById('pw-label');

    if (pwInput && pwFill && pwLabel) {
        pwInput.addEventListener('input', () => {
            const val = pwInput.value;
            let score = 0;
            if (val.length >= 6) score++;
            if (val.length >= 10) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            const levels = [
                { width: '0%', color: 'transparent', label: 'Enter a password' },
                { width: '20%', color: '#ff4444', label: 'Very weak' },
                { width: '40%', color: '#ff8844', label: 'Weak' },
                { width: '60%', color: '#ffcc00', label: 'Fair' },
                { width: '80%', color: '#88dd44', label: 'Strong' },
                { width: '100%', color: '#39ff14', label: 'Very strong' },
            ];
            const level = val.length === 0 ? levels[0] : levels[Math.min(score, 5)];
            pwFill.style.width = level.width;
            pwFill.style.background = level.color;
            pwLabel.textContent = level.label;
            pwLabel.style.color = level.color === 'transparent' ? '' : level.color;
        });
    }

    // ── Get Users from localStorage ───────
    function getUsers() {
        try { return JSON.parse(localStorage.getItem('ag_users') || '[]'); }
        catch { return []; }
    }
    function saveUsers(users) { localStorage.setItem('ag_users', JSON.stringify(users)); }

    function setLoggedIn(user) {
        localStorage.setItem('ag_logged_in', JSON.stringify(user));
    }

    // ── LOGIN ─────────────────────────────
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                setLoggedIn(user);
                showToast(`🚀 Welcome back, ${user.name}!`, 'success');
                // Redirect after short delay
                setTimeout(() => { window.location.href = 'index.html'; }, 1200);
            } else {
                showToast('Invalid email or password', 'error');
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 600);
            }
        });
    }

    // ── SIGN UP ───────────────────────────
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;

            if (!name || !email || !password || !confirm) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }

            if (password !== confirm) {
                showToast('Passwords do not match', 'error');
                const confirmWrap = document.getElementById('signup-confirm').closest('.input-wrap');
                confirmWrap.classList.add('shake');
                setTimeout(() => confirmWrap.classList.remove('shake'), 600);
                return;
            }

            const users = getUsers();
            if (users.find(u => u.email === email)) {
                showToast('An account with this email already exists', 'error');
                return;
            }

            const newUser = { name, email, password, createdAt: new Date().toISOString() };
            users.push(newUser);
            saveUsers(users);
            setLoggedIn(newUser);

            showToast(`✨ Account created! Welcome, ${name}!`, 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        });
    }

    // ── Social buttons (demo) ─────────────
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.textContent.trim();
            showToast(`${provider} sign-in coming soon!`, 'success');
        });
    });

})();
