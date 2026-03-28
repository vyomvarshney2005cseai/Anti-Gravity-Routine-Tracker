/* ═══════════════════════════════════════════
   ANTI-GRAVITY — Daily Routine Tracker
   Core Application Logic v2
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    // ── Auth Check ─────────────────────────────
    function checkAuth() {
        const loggedIn = localStorage.getItem('ag_logged_in');
        if (!loggedIn) {
            window.location.href = 'login.html';
        }
    }
    checkAuth();

    const SEED_TASKS = [
        { id: 1, title: 'Morning Flow (Yoga)', time: '07:30', duration: 20, category: 'Wellness', completed: true },
        { id: 2, title: 'Deep Work (Design)', time: '09:00', duration: 90, category: 'Productivity', completed: false },
        { id: 3, title: 'Hydration Ritual', time: '11:30', duration: 5, category: 'Wellness', completed: false },
        { id: 4, title: 'Mindful Breathing', time: '13:00', duration: 10, category: 'Mindfulness', completed: false },
        { id: 5, title: 'Reading Session', time: '18:00', duration: 30, category: 'Leisure', completed: false },
    ];

    const CATEGORY_COLORS = {
        Productivity: { rgba: 'rgba(0,240,255,', hex: '#00f0ff' },
        Wellness: { rgba: 'rgba(57,255,20,', hex: '#39ff14' },
        Mindfulness: { rgba: 'rgba(126,184,247,', hex: '#7eb8f7' },
        Leisure: { rgba: 'rgba(247,168,213,', hex: '#f7a8d5' },
    };

    const QUOTES = [
        '"Float above your limits."',
        '"Gravity is just a suggestion."',
        '"Orbit your goals, don\'t chase them."',
        '"Weightless mind, boundless progress."',
        '"Defy gravity. Complete the mission."',
        '"In zero-G, every step is a leap."',
        '"Your potential has no ceiling."',
        '"Rise without resistance."',
    ];

    const ACHIEVEMENTS = [
        { id: 'first', icon: '🚀', label: 'First Launch', check: (t, s) => t.some(x => x.completed) },
        { id: 'streak3', icon: '🔥', label: '3-Day Streak', check: (t, s) => s >= 3 },
        { id: 'streak7', icon: '⚡', label: '7-Day Streak', check: (t, s) => s >= 7 },
        { id: 'five', icon: '✨', label: '5 Tasks Done', check: (t) => t.filter(x => x.completed).length >= 5 },
        { id: 'all', icon: '🏆', label: 'All Complete', check: (t) => t.length > 0 && t.every(x => x.completed) },
        { id: 'ten', icon: '🌟', label: '10 Tasks', check: (t) => t.length >= 10 },
    ];

    // ── State ──────────────────────────────
    let tasks = loadTasks();
    let streak = loadStreak();

    function loadTasks() {
        try {
            const raw = localStorage.getItem('ag_tasks');
            return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED_TASKS));
        } catch { return JSON.parse(JSON.stringify(SEED_TASKS)); }
    }
    function saveTasks() { localStorage.setItem('ag_tasks', JSON.stringify(tasks)); }
    function loadStreak() {
        try { return parseInt(localStorage.getItem('ag_streak') || '14', 10); }
        catch { return 14; }
    }
    function saveStreak() { localStorage.setItem('ag_streak', String(streak)); }

    // ── DOM refs ───────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const taskListEl = $('#task-list');
    const modalOverlay = $('#modal-overlay');
    const modalClose = $('#modal-close');
    const taskForm = $('#task-form');
    const navAdd = $('#nav-add');
    const navBtns = document.querySelectorAll('.nav-btn[data-view]');
    const catBtns = document.querySelectorAll('.cat-btn');

    // ── Date header ────────────────────────
    function setDate() {
        const d = new Date();
        const opts = { weekday: 'long', month: 'short', day: 'numeric' };
        const str = d.toLocaleDateString('en-US', opts).toUpperCase();
        document.querySelectorAll('.header-date').forEach(el => el.textContent = str);
    }
    setDate();

    // ── Particles ──────────────────────────
    function spawnParticles() {
        const container = $('#particles');
        for (let i = 0; i < 25; i++) {
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
            container.appendChild(p);
        }
    }
    spawnParticles();

    /* ═══════════════════════════════════════
       HOME VIEW
       ═══════════════════════════════════════ */

    function renderHome() {
        // Quote
        const quoteEl = $('#hero-quote');
        if (quoteEl) quoteEl.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

        // Next task
        const focusEl = $('#focus-task');
        if (focusEl) {
            const pending = [...tasks].filter(t => !t.completed).sort((a, b) => a.time.localeCompare(b.time));
            focusEl.textContent = pending.length > 0 ? `${formatTime(pending[0].time)} — ${pending[0].title}` : 'All done! 🎉';
        }

        // Progress ring
        renderProgressRing();

        // Activity feed
        renderActivityFeed();
    }

    function renderProgressRing() {
        const canvas = document.getElementById('progress-ring');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 160 * dpr;
        canvas.height = 160 * dpr;
        ctx.scale(dpr, dpr);

        const cx = 80, cy = 80, r = 60, lw = 8;
        const done = tasks.filter(t => t.completed).length;
        const total = tasks.length || 1;
        const pct = done / total;

        // Background ring
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Progress arc
        if (pct > 0) {
            const startA = -Math.PI / 2;
            const endA = startA + pct * Math.PI * 2;
            const grad = ctx.createLinearGradient(0, 0, 160, 160);
            grad.addColorStop(0, '#00f0ff');
            grad.addColorStop(1, '#ff00e5');
            ctx.beginPath();
            ctx.arc(cx, cy, r, startA, endA);
            ctx.strokeStyle = grad;
            ctx.lineWidth = lw;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Glow
            ctx.beginPath();
            ctx.arc(cx, cy, r, startA, endA);
            ctx.strokeStyle = 'rgba(0,240,255,0.15)';
            ctx.lineWidth = lw + 8;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Update label
        const ringPct = document.getElementById('ring-pct');
        if (ringPct) ringPct.textContent = `${Math.round(pct * 100)}%`;
    }

    function renderActivityFeed() {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;

        const completed = tasks.filter(t => t.completed);
        const pending = tasks.filter(t => !t.completed);

        let items = [];
        completed.forEach(t => {
            const color = CATEGORY_COLORS[t.category]?.hex || '#00f0ff';
            items.push(`<div class="activity-item"><span class="activity-dot" style="background:${color};box-shadow:0 0 6px ${color}"></span><span class="activity-text">✓ ${t.title}</span><span class="activity-time">${formatTime(t.time)}</span></div>`);
        });
        pending.slice(0, 3).forEach(t => {
            items.push(`<div class="activity-item"><span class="activity-dot" style="background:rgba(255,255,255,0.15)"></span><span class="activity-text">${t.title}</span><span class="activity-time">${formatTime(t.time)}</span></div>`);
        });

        feed.innerHTML = items.length > 0 ? items.join('') : '<div class="activity-item"><span class="activity-text" style="color:var(--text-dim)">No activity yet</span></div>';
    }

    /* ═══════════════════════════════════════
       ROUTINE VIEW — Task Cards
       ═══════════════════════════════════════ */

    function renderTasks() {
        taskListEl.innerHTML = '';

        if (tasks.length === 0) {
            taskListEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🚀</div><h3>Zero Gravity</h3><p>No tasks yet. Tap the + button to launch your first task into orbit.</p></div>`;
            updateStats();
            return;
        }

        const sorted = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

        sorted.forEach((task, idx) => {
            const card = document.createElement('div');
            card.className = 'task-card' + (task.completed ? ' completed' : '');
            card.dataset.id = task.id;
            card.style.animationDelay = `${idx * 0.07}s`;

            const ft = formatTime(task.time);

            // FIXED LAYOUT: checkbox and delete in card-actions, no overlap
            card.innerHTML = `
        <div class="card-top">
          <span class="card-time">${ft}</span>
          <div class="card-actions">
            <span class="card-status">${task.completed ? 'Done' : 'Pending'}</span>
            <button class="card-checkbox" aria-label="Toggle complete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>
            </button>
            <button class="card-delete" title="Delete task">&times;</button>
          </div>
        </div>
        <div class="card-title">${task.title}</div>
        <div class="card-duration">${task.duration} mins</div>
        <span class="card-category" data-cat="${task.category}">${task.category}</span>
      `;

            card.querySelector('.card-checkbox').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleComplete(task.id);
            });

            card.querySelector('.card-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id, card);
            });

            if (task.completed) {
                setTimeout(() => card.classList.add('levitate'), 1800);
            }

            taskListEl.appendChild(card);
        });

        updateStats();
    }

    function formatTime(t) {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        task.completed = !task.completed;
        if (task.completed) showToast(`✨ ${task.title} completed!`);
        saveTasks();
        refreshAll();
    }

    function deleteTask(id, cardEl) {
        cardEl.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        cardEl.style.transform = 'translateX(100px) scale(0.8)';
        cardEl.style.opacity = '0';
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            refreshAll();
            showToast('🗑 Task removed');
        }, 350);
    }

    /* ═══════════════════════════════════════
       STATS
       ═══════════════════════════════════════ */

    function updateStats() {
        const done = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const flow = total > 0 ? Math.round((done / total) * 100) : 0;
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('stat-streak', `${streak} Days`);
        set('stat-done', `${done}/${total} Done`);
        set('stat-flow', `${flow}%`);
        set('stat-streak-2', `${streak} Days`);
        set('stat-done-2', `${done}/${total} Done`);
        set('stat-flow-2', `${flow}%`);
    }

    // ── PIE CHART ──────────────────────────
    let chartAngle = 0;
    let chartRAF = null;

    function renderPieChart() {
        const canvas = document.getElementById('pie-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 260 * dpr; canvas.height = 260 * dpr;
        ctx.scale(dpr, dpr);

        const catCounts = {};
        tasks.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
        const entries = Object.entries(catCounts);
        const total = tasks.length || 1;

        // Legend
        const legendEl = document.getElementById('chart-legend');
        if (legendEl) {
            legendEl.innerHTML = entries.map(([cat, count]) => {
                const pct = Math.round((count / total) * 100);
                const color = CATEGORY_COLORS[cat]?.hex || '#fff';
                return `<div class="legend-item"><span class="legend-dot" style="background:${color};box-shadow:0 0 8px ${color}"></span><div class="legend-info"><span class="legend-label">${cat}</span><span class="legend-value">${pct}%</span></div></div>`;
            }).join('');
        }

        if (chartRAF) cancelAnimationFrame(chartRAF);
        function drawFrame() {
            chartAngle += 0.003;
            ctx.clearRect(0, 0, 260, 260);
            const cx = 130, cy = 130, r = 100;

            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,240,255,0.08)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

            let startAngle = chartAngle;
            entries.forEach(([cat, count], i) => {
                const sliceAngle = (count / total) * Math.PI * 2;
                const midAngle = startAngle + sliceAngle / 2;
                const ox = Math.cos(midAngle) * 5;
                const oy = Math.sin(midAngle) * 5 - Math.sin(chartAngle * 2 + i) * 3;
                const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Productivity'];

                // Shadow
                ctx.save(); ctx.beginPath(); ctx.moveTo(cx + ox, cy + oy + 3);
                ctx.arc(cx + ox, cy + oy + 3, r, startAngle, startAngle + sliceAngle);
                ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill(); ctx.restore();

                // Segment
                ctx.save(); ctx.beginPath(); ctx.moveTo(cx + ox, cy + oy);
                ctx.arc(cx + ox, cy + oy, r, startAngle, startAngle + sliceAngle); ctx.closePath();
                const grad = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r);
                grad.addColorStop(0, color.rgba + '0.15)');
                grad.addColorStop(0.5, color.rgba + '0.25)');
                grad.addColorStop(1, color.rgba + '0.4)');
                ctx.fillStyle = grad; ctx.fill();
                ctx.strokeStyle = color.rgba + '0.6)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

                startAngle += sliceAngle;
            });

            // Donut center
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(10,8,24,0.85)'; ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,240,255,0.12)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();

            const done = tasks.filter(t => t.completed).length;
            ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = '700 24px Outfit, sans-serif'; ctx.fillStyle = '#f0eeff';
            ctx.fillText(`${done}/${tasks.length}`, cx, cy - 5);
            ctx.font = '400 10px Outfit, sans-serif'; ctx.fillStyle = 'rgba(240,238,255,0.45)';
            ctx.fillText('COMPLETED', cx, cy + 14); ctx.restore();

            chartRAF = requestAnimationFrame(drawFrame);
        }
        drawFrame();
    }

    // ── BAR CHART ──────────────────────────
    function renderBarChart() {
        const canvas = document.getElementById('bar-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 340 * dpr; canvas.height = 180 * dpr;
        ctx.scale(dpr, dpr);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date().getDay();
        // Simulate weekly data based on current tasks
        const done = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const data = days.map((_, i) => {
            if (i < today || (today === 0 && i < 7)) {
                return Math.floor(Math.random() * (total + 2)) + 1;
            } else if (i === (today === 0 ? 6 : today - 1)) {
                return done;
            }
            return 0;
        });
        const maxVal = Math.max(...data, 1);
        const w = 340, h = 180, pad = 30, barW = 28, gap = (w - pad * 2 - barW * 7) / 6;

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad + (h - pad * 2) * (1 - i / 4);
            ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
        }

        data.forEach((val, i) => {
            const x = pad + i * (barW + gap);
            const barH = (val / maxVal) * (h - pad * 2 - 10);
            const y = h - pad - barH;

            // Bar gradient
            const grad = ctx.createLinearGradient(x, y, x, h - pad);
            grad.addColorStop(0, 'rgba(0,240,255,0.6)');
            grad.addColorStop(1, 'rgba(255,0,229,0.3)');

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
            ctx.fillStyle = val > 0 ? grad : 'rgba(255,255,255,0.03)';
            ctx.fill();

            // Glow for today
            const todayIdx = (today === 0 ? 6 : today - 1);
            if (i === todayIdx && val > 0) {
                ctx.shadowColor = 'rgba(0,240,255,0.3)';
                ctx.shadowBlur = 12;
                ctx.fill();
            }
            ctx.restore();

            // Day label
            ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.font = '400 10px Outfit, sans-serif';
            ctx.fillStyle = i === todayIdx ? '#00f0ff' : 'rgba(240,238,255,0.3)';
            ctx.fillText(days[i], x + barW / 2, h - pad + 6); ctx.restore();

            // Value on top
            if (val > 0) {
                ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
                ctx.font = '600 11px Outfit, sans-serif'; ctx.fillStyle = 'rgba(240,238,255,0.6)';
                ctx.fillText(val, x + barW / 2, y - 3); ctx.restore();
            }
        });
    }

    // ── LINE CHART ─────────────────────────
    function renderLineChart() {
        const canvas = document.getElementById('line-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 340 * dpr; canvas.height = 180 * dpr;
        ctx.scale(dpr, dpr);

        const w = 340, h = 180, pad = 30;
        const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
        const done = tasks.filter(t => t.completed).length;
        const total = tasks.length || 1;
        const currentPct = Math.round((done / total) * 100);
        // Simulated trend
        const data = [35, 50, 42, 65, 58, 72, currentPct];
        const maxVal = 100;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad + (h - pad * 2) * (1 - i / 4);
            ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
        }

        const stepX = (w - pad * 2) / (data.length - 1);
        const points = data.map((v, i) => ({
            x: pad + i * stepX,
            y: pad + (h - pad * 2) * (1 - v / maxVal)
        }));

        // Fill area
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, h - pad);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, h - pad);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, pad, 0, h - pad);
        areaGrad.addColorStop(0, 'rgba(0,240,255,0.12)');
        areaGrad.addColorStop(1, 'rgba(0,240,255,0.01)');
        ctx.fillStyle = areaGrad; ctx.fill();
        ctx.restore();

        // Line
        ctx.save();
        ctx.beginPath();
        points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        const lineGrad = ctx.createLinearGradient(pad, 0, w - pad, 0);
        lineGrad.addColorStop(0, '#00f0ff');
        lineGrad.addColorStop(1, '#ff00e5');
        ctx.strokeStyle = lineGrad; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.restore();

        // Dots
        points.forEach((p, i) => {
            ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = i === points.length - 1 ? '#00f0ff' : 'rgba(0,240,255,0.5)';
            ctx.fill();
            if (i === points.length - 1) {
                ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,240,255,0.12)'; ctx.fill();
            }
            ctx.restore();
        });

        // Labels
        points.forEach((p, i) => {
            ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.font = '400 10px Outfit, sans-serif';
            ctx.fillStyle = i === points.length - 1 ? '#00f0ff' : 'rgba(240,238,255,0.3)';
            ctx.fillText(labels[i], p.x, h - pad + 6); ctx.restore();
        });

        // Current value
        const last = points[points.length - 1];
        ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.font = '600 11px Outfit, sans-serif'; ctx.fillStyle = '#00f0ff';
        ctx.fillText(`${currentPct}%`, last.x, last.y - 10); ctx.restore();
    }

    // ── RADAR CHART ────────────────────────
    function renderRadarChart() {
        const canvas = document.getElementById('radar-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 260 * dpr; canvas.height = 260 * dpr;
        ctx.scale(dpr, dpr);

        const cx = 130, cy = 130, r = 90;
        const cats = Object.keys(CATEGORY_COLORS);
        const n = cats.length;

        // Calculate values per category (0-1)
        const vals = cats.map(cat => {
            const catTasks = tasks.filter(t => t.category === cat);
            if (catTasks.length === 0) return 0.1;
            return catTasks.filter(t => t.completed).length / catTasks.length;
        });

        // Web rings
        for (let ring = 1; ring <= 4; ring++) {
            const rr = r * (ring / 4);
            ctx.save(); ctx.beginPath();
            for (let i = 0; i <= n; i++) {
                const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                const x = cx + Math.cos(angle) * rr;
                const y = cy + Math.sin(angle) * rr;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.restore();
        }

        // Axes
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
            ctx.save(); ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.restore();
        }

        // Value polygon fill
        ctx.save(); ctx.beginPath();
        vals.forEach((v, i) => {
            const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
            const vr = Math.max(v, 0.1) * r;
            const x = cx + Math.cos(angle) * vr;
            const y = cy + Math.sin(angle) * vr;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,240,255,0.1)'; ctx.fill();
        ctx.strokeStyle = 'rgba(0,240,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();

        // Dots and labels
        vals.forEach((v, i) => {
            const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
            const vr = Math.max(v, 0.1) * r;
            const x = cx + Math.cos(angle) * vr;
            const y = cy + Math.sin(angle) * vr;
            const color = CATEGORY_COLORS[cats[i]];

            // Dot
            ctx.save(); ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color.hex; ctx.fill();
            ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = color.rgba + '0.15)'; ctx.fill();
            ctx.restore();

            // Label
            const lx = cx + Math.cos(angle) * (r + 18);
            const ly = cy + Math.sin(angle) * (r + 18);
            ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = '500 10px Outfit, sans-serif'; ctx.fillStyle = color.hex;
            ctx.fillText(cats[i], lx, ly); ctx.restore();
        });
    }

    function renderAllCharts() {
        renderPieChart();
        renderBarChart();
        renderLineChart();
        renderRadarChart();
    }

    /* ═══════════════════════════════════════
       PROFILE VIEW
       ═══════════════════════════════════════ */

    function renderProfile() {
        // Update user info from localStorage
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const loggedInRaw = localStorage.getItem('ag_logged_in');
        if (loggedInRaw) {
            try {
                const user = JSON.parse(loggedInRaw);
                if (profileName) profileName.textContent = user.name || 'Space Traveler';
                if (profileEmail) profileEmail.textContent = user.email || 'Anti-Gravity Explorer';
            } catch (e) { }
        }

        // Achievements
        const grid = document.getElementById('achievements-grid');
        if (grid) {
            grid.innerHTML = ACHIEVEMENTS.map(a => {
                const unlocked = a.check(tasks, streak);
                return `<div class="achievement ${unlocked ? 'unlocked' : 'locked'}">
          <span class="achievement-icon">${a.icon}</span>
          <span class="achievement-label">${a.label}</span>
        </div>`;
            }).join('');
        }

        // Profile Stats
        const statsEl = document.getElementById('profile-stats');
        if (statsEl) {
            const done = tasks.filter(t => t.completed).length;
            const totalMins = tasks.reduce((s, t) => s + t.duration, 0);
            const doneMins = tasks.filter(t => t.completed).reduce((s, t) => s + t.duration, 0);
            statsEl.innerHTML = `
        <div class="profile-stat-card"><span class="profile-stat-val">${tasks.length}</span><span class="profile-stat-lbl">Total Tasks</span></div>
        <div class="profile-stat-card"><span class="profile-stat-val">${done}</span><span class="profile-stat-lbl">Completed</span></div>
        <div class="profile-stat-card"><span class="profile-stat-val">${totalMins}m</span><span class="profile-stat-lbl">Planned Time</span></div>
        <div class="profile-stat-card"><span class="profile-stat-val">${doneMins}m</span><span class="profile-stat-lbl">Time Invested</span></div>
      `;
        }
    }

    // Settings
    const btnReset = document.getElementById('btn-reset');
    const btnClear = document.getElementById('btn-clear-data');
    const btnLogout = document.getElementById('btn-logout');

    if (btnReset) btnReset.addEventListener('click', () => {
        tasks = JSON.parse(JSON.stringify(SEED_TASKS));
        saveTasks();
        refreshAll();
        showToast('🔄 Tasks reset to defaults');
    });

    if (btnClear) btnClear.addEventListener('click', () => {
        if (!confirm('Clear tasks and streak? This cannot be undone.')) return;
        localStorage.removeItem('ag_tasks');
        localStorage.removeItem('ag_streak');
        tasks = JSON.parse(JSON.stringify(SEED_TASKS));
        streak = 14;
        saveTasks();
        saveStreak();
        refreshAll();
        showToast('🗑 Routine data cleared');
    });

    if (btnLogout) btnLogout.addEventListener('click', () => {
        if (!confirm('Are you sure you want to log out?')) return;
        localStorage.removeItem('ag_logged_in');
        window.location.href = 'login.html';
    });

    /* ═══════════════════════════════════════
       MODAL
       ═══════════════════════════════════════ */

    function openModal() { modalOverlay.classList.add('open'); }
    function closeModal() { modalOverlay.classList.remove('open'); taskForm.reset(); selectCategory('Productivity'); }

    navAdd.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

    let selectedCategory = 'Productivity';
    function selectCategory(cat) {
        selectedCategory = cat;
        catBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    }
    catBtns.forEach(b => b.addEventListener('click', () => selectCategory(b.dataset.cat)));

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = $('#task-title').value.trim();
        const time = $('#task-time').value;
        const duration = parseInt($('#task-duration').value, 10) || 30;
        if (!title || !time) return;

        tasks.push({ id: Date.now(), title, time, duration, category: selectedCategory, completed: false });
        saveTasks();
        refreshAll();
        closeModal();
        showToast(`🚀 ${title} launched!`);
    });

    /* ═══════════════════════════════════════
       NAVIGATION
       ═══════════════════════════════════════ */

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.dataset.view;
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(targetView).classList.add('active');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Render content for active view
            if (targetView === 'view-home') renderHome();
            if (targetView === 'view-routine') renderTasks();
            if (targetView === 'view-stats') renderAllCharts();
            if (targetView === 'view-profile') renderProfile();
        });
    });

    /* ═══════════════════════════════════════
       TOAST
       ═══════════════════════════════════════ */

    function showToast(msg) {
        let toast = document.querySelector('.toast');
        if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
        toast.textContent = msg;
        toast.classList.remove('show');
        void toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    /* ═══════════════════════════════════════
       REFRESH ALL + INIT
       ═══════════════════════════════════════ */

    function refreshAll() {
        renderHome();
        renderTasks();
        updateStats();
        renderAllCharts();
        renderProfile();
    }

    // Init
    refreshAll();
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

})();
