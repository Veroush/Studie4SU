function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== 'admin') { window.location.href = 'index.html'; }
}
checkAdminAccess();

'use strict';

// ── SideBar & Overlay ─────────────────────────────────────────
const sidebar       = document.getElementById('sidebar');
const overlay       = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

mobileMenuBtn.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open');
  overlay.classList.toggle('visible', isOpen);
  mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  mobileMenuBtn.setAttribute('aria-expanded', 'false');
});

// ── Logout ────────────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login.html';
  }
});

// ── Helpers ───────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function countUp(el, target, duration = 800) {
  const start = 0;
  const step  = target / (duration / 16);
  let   cur   = start;
  const timer = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(timer); }
    el.textContent = Math.floor(cur).toLocaleString();
  }, 16);
}

function clusterBadge(cluster) {
  const cls = 'badge-' + (cluster || 'TECH');
  return `<span class="cluster-badge ${cls}">${cluster || '?'}</span>`;
}

// ── Charting ──────────────────────────────────────────────────
let chartClusters = null;
let chartPopular  = null;

const CLUSTER_COLORS = {
  TECH: '#3b82f6', MED: '#ec4899', BUS: '#f59e0b',
  SOC: '#8b5cf6', EDU: '#22c55e', SCI: '#06b6d4', LAW: '#ef4444'
};

function renderCharts(clusterData) {
  const labels = clusterData.map(c => c.topCluster);
  const counts = clusterData.map(c => Number(c.count));
  const colors = labels.map(l => CLUSTER_COLORS[l] || '#9ca3af');

  // Bar chart
  if (chartClusters) chartClusters.destroy();
  const ctx1 = document.getElementById('chart-clusters').getContext('2d');
  chartClusters = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Quiz Results', data: counts, backgroundColor: colors.map(c => c + '99'), borderColor: colors, borderWidth: 2, borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} result${ctx.parsed.y !== 1 ? 's' : ''}` } } },
      scales: { x: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#6b7280' } }, y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 1, font: { size: 12 }, color: '#6b7280' } } }
    }
  });

  // Doughnut chart
  if (chartPopular) chartPopular.destroy();
  const ctx2 = document.getElementById('chart-popular').getContext('2d');
  chartPopular = new Chart(ctx2, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: counts, backgroundColor: colors, borderWidth: 2, borderColor: '#ffffff', hoverOffset: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 16, font: { size: 12 }, color: '#374151' } } } }
  });
}

function renderClusterBars(clusterData) {
  const list = document.getElementById('cluster-list');
  if (!clusterData.length) {
    list.innerHTML = '<div style="color:var(--color-gray-400);font-size:var(--text-sm);">No data yet.</div>';
    return;
  }
  const max = Math.max(...clusterData.map(c => Number(c.count)));
  list.innerHTML = clusterData.map(c => {
    const pct  = max > 0 ? (Number(c.count) / max) * 100 : 0;
    const color = CLUSTER_COLORS[c.topCluster] || '#9ca3af';
    return `<div class="cluster-row"><span class="cluster-name">${c.topCluster}</span><div class="cluster-bar-wrap"><div class="cluster-bar" style="width:0%;background:${color}" data-target="${pct}"></div></div><span class="cluster-count">${c.count}</span></div>`;
  }).join('');
  setTimeout(() => { list.querySelectorAll('.cluster-bar').forEach(bar => { bar.style.width = bar.dataset.target + '%'; }); }, 80);
}

// ── API Loads ─────────────────────────────────────────────────
async function loadStats() {
  try {
    const countRes  = await fetch('/admin/results/count');
    const countData = await countRes.json();
    countUp(document.getElementById('stat-quizzes'), countData.totalStudents ?? 0);
    document.getElementById('stat-schools').textContent  = '7';
    document.getElementById('stat-programs').textContent = '7';
  } catch {
    document.getElementById('stat-quizzes').textContent = 'N/A';
    document.getElementById('stat-schools').textContent = '7';
    document.getElementById('stat-programs').textContent = '7';
  }
}

async function loadResults() {
  const tbody = document.getElementById('results-tbody');
  try {
    const res = await fetch('/admin/results');
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="table-empty">No quiz results yet.</td></tr>`;
      return;
    }
    const recent = [...data].reverse().slice(0, 10);
    tbody.innerHTML = recent.map(r => `<tr><td>${clusterBadge(r.topCluster)}</td><td>${r.recommendedProgram?.name ?? '—'}</td><td>${r.recommendedProgram?.school?.name ?? '—'}</td><td>${formatDate(r.createdAt)}</td></tr>`).join('');
  } catch {
    tbody.innerHTML = `<tr><td colspan="4" class="table-empty">Could not load results.</td></tr>`;
  }
}

async function loadClusters() {
  try {
    const res = await fetch('/admin/results/by-cluster');
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById('cluster-list').innerHTML = '<div style="color:var(--color-gray-400);font-size:var(--text-sm);">No quiz data yet.</div>';
      renderCharts([]);
      return;
    }
    renderCharts(data);
    renderClusterBars(data);
  } catch {
    document.getElementById('cluster-list').innerHTML = '<div style="color:var(--color-gray-400);font-size:var(--text-sm);">Could not load cluster data.</div>';
  }
}

async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  const statEl = document.getElementById('stat-users');
  try {
    const res = await fetch('/admin/users');
    if (res.status === 404) {
      tbody.innerHTML = `<tr><td colspan="2" class="table-empty">Add the <code>/admin/users</code> route.</td></tr>`;
      statEl.textContent = '—';
      return;
    }
    const data = await res.json();
    countUp(statEl, Array.isArray(data) ? data.length : 0);
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="2" class="table-empty">No users yet.</td></tr>`;
      return;
    }
    const recent = [...data].reverse().slice(0, 8);
    tbody.innerHTML = recent.map(u => `<tr><td>${u.email ?? '—'}</td><td>${formatDate(u.createdAt)}</td></tr>`).join('');
  } catch {
    tbody.innerHTML = `<tr><td colspan="2" class="table-empty">Could not load users.</td></tr>`;
    statEl.textContent = '—';
  }
}

// ── Init ──────────────────────────────────────────────────────
document.getElementById('refresh-results-btn').addEventListener('click', async function() {
  this.classList.add('spinning');
  await Promise.all([loadResults(), loadClusters()]);
  this.classList.remove('spinning');
});

async function init() {
  await Promise.all([loadStats(), loadResults(), loadClusters(), loadUsers()]);
}

init();

// Auto-refresh every 60 seconds
setInterval(init, 60_000);