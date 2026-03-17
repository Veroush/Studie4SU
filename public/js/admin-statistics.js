/* =============================================
   admin-statistics.js
   Follows the same patterns as admin-dashboard.js
   ============================================= */

// ── Auth Guard (same as dashboard) ───────────
function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== 'admin') { window.location.href = 'index.html'; }
}
checkAdminAccess();

'use strict';

// ── Sidebar & Overlay ─────────────────────────
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

// ── Logout ────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login.html';
  }
});

// ── Set admin name ────────────────────────────
try {
  const token   = localStorage.getItem('auth_token');
  const payload = JSON.parse(atob(token.split('.')[1]));
  document.getElementById('admin-name').textContent = payload.name || 'Admin User';
} catch {}

// ── Helpers ───────────────────────────────────
function formatNumber(n) {
  return Number(n).toLocaleString('nl-NL');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Chart instances ───────────────────────────
let chartClusters    = null;
let chartPopular     = null;
let chartFavSchools  = null;
let chartCompared    = null;
let chartActivity    = null;

// ── Cluster colors (matches dashboard) ───────
const CLUSTER_COLORS = {
  TECH: '#3b82f6', MED: '#ec4899', BUS: '#f59e0b',
  SOC:  '#8b5cf6', EDU: '#22c55e', SCI: '#06b6d4', LAW: '#ef4444'
};

function clusterColor(name) {
  return CLUSTER_COLORS[name] || '#9ca3af';
}

// ── Mock data ─────────────────────────────────
const mockFavoritedSchools = [
  { name: 'Anton de Kom Universiteit', count: 342 },
  { name: 'NATIN',                     count: 287 },
  { name: 'IOL',                       count: 201 },
  { name: 'ADEKUS',                    count: 175 },
  { name: 'Hogeschool Suriname',       count: 139 },
];

const mockComparedSchools = [
  { name: 'NATIN',                     comparisons: 218 },
  { name: 'Anton de Kom Universiteit', comparisons: 194 },
  { name: 'IOL',                       comparisons: 162 },
  { name: 'Hogeschool Suriname',       comparisons: 98  },
  { name: 'COVAB',                     comparisons: 74  },
];

// ── Render: cluster bar chart + doughnut ──────
function renderClusterCharts(clusterData) {
  const labels = clusterData.map(c => c.result);
  const counts = clusterData.map(c => Number(c.count));
  const colors = labels.map(clusterColor);

  // Bar chart
  if (chartClusters) chartClusters.destroy();
  const ctx1 = document.getElementById('chart-clusters').getContext('2d');
  chartClusters = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Quiz Results',
        data: counts,
        backgroundColor: colors.map(c => c + '99'),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} result${ctx.parsed.y !== 1 ? 's' : ''}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#6b7280' } },
        y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 1, font: { size: 12 }, color: '#6b7280' } }
      }
    }
  });

  // Doughnut chart
  if (chartPopular) chartPopular.destroy();
  const ctx2 = document.getElementById('chart-popular').getContext('2d');
  chartPopular = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: counts, backgroundColor: colors, borderWidth: 2, borderColor: '#ffffff', hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, padding: 16, font: { size: 12 }, color: '#374151' } }
      }
    }
  });
}

// ── Render: cluster bar rows ──────────────────
function renderClusterBars(clusterData) {
  const list = document.getElementById('cluster-list');
  if (!clusterData.length) {
    list.innerHTML = '<div style="color:var(--color-gray-400);font-size:var(--text-sm);">No quiz data yet.</div>';
    return;
  }
  const max = Math.max(...clusterData.map(c => Number(c.count)));
  list.innerHTML = clusterData.map(c => {
    const pct   = max > 0 ? (Number(c.count) / max) * 100 : 0;
    const color = clusterColor(c.result);
    return `
      <div class="cluster-row">
        <span class="cluster-name">${escHtml(c.result)}</span>
        <div class="cluster-bar-wrap">
          <div class="cluster-bar" style="width:0%;background:${color}" data-target="${pct}"></div>
        </div>
        <span class="cluster-count">${c.count}</span>
      </div>`;
  }).join('');
  // Animate bars
  setTimeout(() => {
    list.querySelectorAll('.cluster-bar').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  }, 80);
}

// ── Render: ranked list ───────────────────────
function renderRankedList(containerId, items, countLabel) {
  const container = document.getElementById(containerId);
  if (!items.length) {
    container.innerHTML = '<div style="color:var(--color-gray-400);font-size:var(--text-sm);">No data.</div>';
    return;
  }
  container.innerHTML = items.slice(0, 5).map((item, i) => `
    <div class="ranked-item">
      <div class="ranked-item-left">
        <div class="rank-badge">${i + 1}</div>
        <span class="ranked-item-name">${escHtml(item.name)}</span>
      </div>
      <span class="ranked-item-count">${formatNumber(item[countLabel])} ${countLabel === 'count' ? '♥' : '×'}</span>
    </div>
  `).join('');
}

// ── Render: small bar chart for rankings ──────
function renderSmallBarChart(canvasId, items, valueKey, instanceRef) {
  if (instanceRef) instanceRef.destroy();
  const ctx = document.getElementById(canvasId).getContext('2d');
  const colors = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];
  const inst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items.slice(0, 5).map(d => d.name.split(' ').pop()),
      datasets: [{
        data:            items.slice(0, 5).map(d => d[valueKey]),
        backgroundColor: colors,
        borderRadius:    4,
        borderSkipped:   false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#6b7280' } },
        y: { grid: { color: '#f3f4f6' }, beginAtZero: true, ticks: { precision: 0, font: { size: 11 }, color: '#6b7280' } }
      }
    }
  });
  return inst;
}

// ── Render: activity line chart ───────────────
function renderActivityChart() {
  if (chartActivity) chartActivity.destroy();
  const ctx = document.getElementById('chart-activity').getContext('2d');
  chartActivity = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Sep', 'Okt', 'Nov', 'Dec', 'Jan', 'Feb'],
      datasets: [
        {
          label: 'Visits',
          data: [1200, 1350, 1500, 1400, 1650, 1800],
          borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.07)',
          borderWidth: 2, pointRadius: 4, fill: true, tension: 0.4,
        },
        {
          label: 'Searches',
          data: [450, 500, 520, 480, 550, 580],
          borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.07)',
          borderWidth: 2, pointRadius: 4, fill: true, tension: 0.4,
        },
        {
          label: 'Favorites',
          data: [120, 135, 150, 145, 160, 175],
          borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.07)',
          borderWidth: 2, pointRadius: 4, fill: true, tension: 0.4,
        },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 }, color: '#374151' } },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#6b7280' } },
        y: { grid: { color: '#f3f4f6' }, beginAtZero: true, ticks: { font: { size: 12 }, color: '#6b7280' } },
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
    }
  });
}

// ── API: load quiz results & clusters ─────────
async function loadQuizData() {
  try {
    const token = localStorage.getItem('auth_token');
    const res   = await fetch('/admin/results', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById('cluster-list').innerHTML =
        '<div style="color:var(--color-gray-400);font-size:var(--text-sm);">No quiz data yet.</div>';
      renderClusterCharts([]);
      document.getElementById('metric-total-quizzes').textContent   = '0';
      document.getElementById('metric-quizzes-month').textContent   = '0';
      document.getElementById('metric-unique-clusters').textContent = '0';
      return;
    }

    // Aggregate by `result` field
    const countMap = {};
    data.forEach(r => {
      if (r.result) countMap[r.result] = (countMap[r.result] || 0) + 1;
    });
    const clusterData = Object.entries(countMap)
      .map(([result, count]) => ({ result, count }))
      .sort((a, b) => b.count - a.count);

    renderClusterCharts(clusterData);
    renderClusterBars(clusterData);

    // Metrics
    const now   = new Date();
    const month = data.filter(r => {
      const d = new Date(r.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    document.getElementById('metric-total-quizzes').textContent   = formatNumber(data.length);
    document.getElementById('metric-quizzes-month').textContent   = formatNumber(month);
    document.getElementById('metric-unique-clusters').textContent = Object.keys(countMap).length;

  } catch (err) {
    console.error('Quiz data error:', err);
    document.getElementById('cluster-list').innerHTML =
      '<div style="color:var(--color-gray-400);font-size:var(--text-sm);">Could not load quiz data.</div>';
  }
}

// ── API: load content status (live) ──────────
async function loadContentStatus() {
  try {
    const token   = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const [schoolsRes, programsRes, usersRes] = await Promise.all([
      fetch('/admin/schools',  { headers }),
      fetch('/admin/programs', { headers }),
      fetch('/admin/users',    { headers }),
    ]);

    const schools  = schoolsRes.ok  ? await schoolsRes.json()  : [];
    const programs = programsRes.ok ? await programsRes.json() : [];
    const users    = usersRes.ok    ? await usersRes.json()    : [];

    document.getElementById('metric-total-schools').textContent  = formatNumber(schools.length);
    document.getElementById('metric-total-programs').textContent = formatNumber(programs.length);
    document.getElementById('metric-total-users').textContent    = formatNumber(users.length);
  } catch (err) {
    console.error('Content status error:', err);
  }
}

// ── Render: rankings (mock) ───────────────────
function loadRankings() {
  renderRankedList('favorited-schools-list', mockFavoritedSchools, 'count');
  chartFavSchools = renderSmallBarChart('fav-schools-chart', mockFavoritedSchools, 'count', chartFavSchools);

  renderRankedList('compared-list', mockComparedSchools, 'comparisons');
  chartCompared = renderSmallBarChart('compared-chart', mockComparedSchools, 'comparisons', chartCompared);
}

// ── Refresh handler ───────────────────────────
document.getElementById('refresh-btn').addEventListener('click', async function () {
  this.classList.add('spinning');
  await Promise.all([loadQuizData(), loadContentStatus()]);
  this.classList.remove('spinning');
});

// ── Init ──────────────────────────────────────
async function init() {
  await Promise.all([loadQuizData(), loadContentStatus()]);
  loadRankings();
  renderActivityChart();
}

init();