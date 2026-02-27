// ============================================================
//  admin-openhouses.js — Open Houses management page
// ============================================================

function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== 'admin') { window.location.href = 'index.html'; }
}
checkAdminAccess();

// ── State ────────────────────────────────────────────────────
let allOpenHouses = [];
let allSchools    = [];
let filtered      = [];
let sortCol       = 'date';
let sortDir       = 'asc';
let currentPage   = 1;
const PAGE_SIZE   = 10;
let editingId     = null;
let deleteTargetId = null;

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  loadData();
  bindEvents();
});

// ── Auth ─────────────────────────────────────────────────────
function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function initAuth() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  const payload = decodeToken(token);
  if (payload && payload.name) {
    document.getElementById('admin-name').textContent = payload.name;
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('auth_token');
  window.location.href = 'login.html';
});

// ── Mobile sidebar ───────────────────────────────────────────
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('visible');
});
document.getElementById('sidebar-overlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
});

// ── Load data ─────────────────────────────────────────────────
async function loadData() {
  await Promise.all([loadSchools(), loadOpenHouses()]);
}

async function loadOpenHouses() {
  try {
    const res = await fetch('/openhouses');
    if (!res.ok) throw new Error('Failed to load');
    allOpenHouses = await res.json();
    applyFiltersAndRender();
  } catch (err) {
    document.getElementById('oh-tbody').innerHTML = `
      <tr><td colspan="6" style="padding:40px 16px;text-align:center;color:var(--color-red-600);font-size:var(--text-sm);">
        Failed to load open houses. Is the server running?
      </td></tr>`;
    console.error('[admin-openhouses] load error:', err);
  }
}

async function loadSchools() {
  try {
    const res = await fetch('/admin/schools');
    if (!res.ok) throw new Error('Failed to load schools');
    allSchools = await res.json();
    populateSchoolDropdowns();
  } catch (err) {
    console.error('[admin-openhouses] schools load error:', err);
  }
}

function populateSchoolDropdowns() {
  const filterSchool = document.getElementById('filter-school');
  filterSchool.innerHTML = '<option value="">All Schools</option>';
  allSchools.forEach(s => {
    filterSchool.innerHTML += `<option value="${escHtml(s.id)}">${escHtml(s.name)}</option>`;
  });

  const fieldSchool = document.getElementById('field-school');
  fieldSchool.innerHTML = '<option value="">Select school...</option>';
  allSchools.forEach(s => {
    fieldSchool.innerHTML += `<option value="${escHtml(s.id)}">${escHtml(s.name)}</option>`;
  });
}

// ── Bind events ───────────────────────────────────────────────
function bindEvents() {
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { currentPage = 1; applyFiltersAndRender(); }, 250);
  });
  document.getElementById('filter-school').addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('filter-date').addEventListener('change',   () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('filter-type').addEventListener('change',   () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('btn-clear-filters').addEventListener('click', clearFilters);

  // Sorting
  document.querySelectorAll('.oh-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortCol = col; sortDir = 'asc'; }
      currentPage = 1;
      applyFiltersAndRender();
    });
  });

  document.getElementById('btn-add-oh').addEventListener('click', openAddModal);

  document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-modal-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-modal-confirm').addEventListener('click', confirmDelete);

  document.getElementById('form-modal-close').addEventListener('click', closeFormModal);
  document.getElementById('form-modal-cancel').addEventListener('click', closeFormModal);
  document.getElementById('form-modal-submit').addEventListener('click', submitForm);

  document.getElementById('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });
  document.getElementById('form-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeFormModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDeleteModal(); closeFormModal(); }
  });
}

// ── Filter + sort + render ────────────────────────────────────
function applyFiltersAndRender() {
  const search  = document.getElementById('search-input').value.trim().toLowerCase();
  const schoolF = document.getElementById('filter-school').value;
  const dateF   = document.getElementById('filter-date').value;
  const typeF   = document.getElementById('filter-type').value;

  const now       = new Date(); now.setHours(0,0,0,0);
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  filtered = allOpenHouses.filter(oh => {
    const matchSearch = !search ||
      (oh.title   && oh.title.toLowerCase().includes(search)) ||
      (oh.location && oh.location.toLowerCase().includes(search)) ||
      (oh.school  && oh.school.name.toLowerCase().includes(search));

    const matchSchool = !schoolF || oh.schoolId === schoolF;

    const matchType = !typeF ||
      (typeF === 'online'   &&  oh.isOnline) ||
      (typeF === 'inperson' && !oh.isOnline);

    let matchDate = true;
    if (dateF && oh.date) {
      const d = new Date(oh.date); d.setHours(0,0,0,0);
      if (dateF === 'upcoming')   matchDate = d >= now;
      if (dateF === 'past')       matchDate = d < now;
      if (dateF === 'this-month') matchDate = d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      if (dateF === 'next-month') {
        const nm = (thisMonth + 1) % 12;
        const ny = thisMonth === 11 ? thisYear + 1 : thisYear;
        matchDate = d.getMonth() === nm && d.getFullYear() === ny;
      }
    }

    return matchSearch && matchSchool && matchDate && matchType;
  });

  // Sort
  filtered.sort((a, b) => {
    let va, vb;
    if (sortCol === 'date') {
      va = new Date(a.date || 0).getTime();
      vb = new Date(b.date || 0).getTime();
    } else if (sortCol === 'title') {
      va = (a.title || '').toLowerCase();
      vb = (b.title || '').toLowerCase();
    } else if (sortCol === 'status') {
      va = getStatusLabel(a);
      vb = getStatusLabel(b);
    } else { va = ''; vb = ''; }

    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  // Update sort icons
  document.querySelectorAll('.oh-table th.sortable').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.dataset.col === sortCol) th.classList.add('sort-' + sortDir);
  });

  renderTable();
  renderPagination();
  updateCountLabel();
}

function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-school').value = '';
  document.getElementById('filter-date').value = '';
  document.getElementById('filter-type').value = '';
  currentPage = 1;
  applyFiltersAndRender();
}

// ── Render table ──────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('oh-tbody');
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  if (page.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>${allOpenHouses.length === 0 ? 'No open houses found in the database.' : 'No open houses match your filters.'}</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = page.map(oh => {
    const schoolName = oh.school?.name || oh.schoolId || '—';
    const dateStr    = oh.date ? formatDate(oh.date) : '—';
    const timeStr    = formatTimeRange(oh.startTime, oh.endTime);
    const location   = oh.isOnline
      ? `<span class="online-badge">Online</span>`
      : escHtml(oh.location || '—');
    const statusHtml = getStatusBadge(oh);

    return `
      <tr>
        <td>
          <div class="oh-title-cell">${escHtml(oh.title || '—')}</div>
          <div class="oh-school-name">${escHtml(schoolName)}</div>
        </td>
        <td>
          <div class="date-display">
            <svg class="date-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${escHtml(dateStr)}
          </div>
        </td>
        <td>${escHtml(timeStr)}</td>
        <td>${location}</td>
        <td>${statusHtml}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn action-btn-edit" onclick="openEditModal('${escHtml(oh.id)}')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="action-btn action-btn-delete" onclick="openDeleteModal('${escHtml(oh.id)}', '${escHtml(oh.title || oh.id)}')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── Status helpers ────────────────────────────────────────────
function getStatusLabel(oh) {
  if (!oh.date) return 'unknown';
  const d   = new Date(oh.date); d.setHours(0,0,0,0);
  const now = new Date();        now.setHours(0,0,0,0);
  if (d.getTime() === now.getTime()) return 'today';
  if (d > now) return 'upcoming';
  return 'past';
}

function getStatusBadge(oh) {
  const label = getStatusLabel(oh);
  const map = {
    upcoming: ['status-upcoming', 'Upcoming'],
    today:    ['status-today',    'Today'],
    past:     ['status-past',     'Past'],
  };
  const [cls, text] = map[label] || ['status-past', 'Unknown'];
  return `<span class="status-badge ${cls}">${text}</span>`;
}

// ── Date / time formatters ────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  // Prevent timezone shifting: parse as local
  const [year, month, day] = dateStr.split('T')[0].split('-');
  const local = new Date(year, month - 1, day);
  return local.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours);
  const period = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${minutes} ${period}`;
}

function formatTimeRange(start, end) {
  if (!start && !end) return '—';
  if (start && end)   return `${formatTime(start)} – ${formatTime(end)}`;
  if (start)          return formatTime(start);
  return formatTime(end);
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination() {
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pag  = document.getElementById('pagination');
  const info = document.getElementById('pagination-info');

  const start = Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length);
  const end   = Math.min(currentPage * PAGE_SIZE, filtered.length);
  info.textContent = filtered.length > 0
    ? `Showing ${start}–${end} of ${filtered.length} event${filtered.length !== 1 ? 's' : ''}`
    : '';

  if (totalPages <= 1) { pag.innerHTML = ''; return; }

  let html = `
    <button class="pagination-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="pagination-page ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="pagination-page" style="border:none;background:none;cursor:default;">…</span>`;
    }
  }

  html += `
    <button class="pagination-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;

  pag.innerHTML = html;
}

function goPage(n) {
  const total = Math.ceil(filtered.length / PAGE_SIZE);
  if (n < 1 || n > total) return;
  currentPage = n;
  renderTable();
  renderPagination();
}

function updateCountLabel() {
  document.getElementById('oh-count-label').textContent =
    `${allOpenHouses.length} event${allOpenHouses.length !== 1 ? 's' : ''} in the system`;
}

// ── Delete modal ──────────────────────────────────────────────
function openDeleteModal(id, name) {
  deleteTargetId = id;
  document.getElementById('modal-oh-name').textContent = name;
  document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const btn = document.getElementById('delete-modal-confirm');
  btn.textContent = 'Deleting...';
  btn.disabled = true;

  try {
    const res = await fetch(`/openhouses/${deleteTargetId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Delete failed');
    }
    allOpenHouses = allOpenHouses.filter(oh => oh.id !== deleteTargetId);
    closeDeleteModal();
    applyFiltersAndRender();
    showToast('Open house deleted successfully', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to delete open house', 'error');
    console.error('[admin-openhouses] delete error:', err);
  } finally {
    btn.textContent = 'Delete Open House';
    btn.disabled = false;
  }
}

// ── Add / Edit modal ──────────────────────────────────────────
function openAddModal() {
  editingId = null;
  document.getElementById('form-modal-title').textContent = 'Add Open House';
  document.getElementById('form-modal-submit').textContent = 'Add Open House';
  clearForm();
  document.getElementById('form-modal').style.display = 'flex';
}

function openEditModal(id) {
  const oh = allOpenHouses.find(x => x.id === id);
  if (!oh) return;
  editingId = id;
  document.getElementById('form-modal-title').textContent = 'Edit Open House';
  document.getElementById('form-modal-submit').textContent = 'Save Changes';
  clearForm();

  document.getElementById('field-title').value       = oh.title || '';
  document.getElementById('field-school').value      = oh.schoolId || '';
  document.getElementById('field-date').value        = oh.date ? oh.date.split('T')[0] : '';
  document.getElementById('field-start-time').value  = oh.startTime || '';
  document.getElementById('field-end-time').value    = oh.endTime || '';
  document.getElementById('field-location').value    = oh.location || '';
  document.getElementById('field-online').checked    = oh.isOnline || false;
  document.getElementById('field-description').value = oh.description || '';

  document.getElementById('form-modal').style.display = 'flex';
}

function closeFormModal() {
  document.getElementById('form-modal').style.display = 'none';
  editingId = null;
  clearForm();
}

function clearForm() {
  document.getElementById('field-title').value       = '';
  document.getElementById('field-school').value      = '';
  document.getElementById('field-date').value        = '';
  document.getElementById('field-start-time').value  = '';
  document.getElementById('field-end-time').value    = '';
  document.getElementById('field-location').value    = '';
  document.getElementById('field-online').checked    = false;
  document.getElementById('field-description').value = '';

  ['field-title','field-school','field-date'].forEach(id => {
    document.getElementById(id).classList.remove('has-error');
  });
  ['err-title','err-school','err-date'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function validateForm() {
  let valid = true;
  const checks = [
    { id: 'field-title',  err: 'err-title',  msg: 'Title is required' },
    { id: 'field-school', err: 'err-school', msg: 'School is required' },
    { id: 'field-date',   err: 'err-date',   msg: 'Date is required' },
  ];
  checks.forEach(({ id, err, msg }) => {
    const el    = document.getElementById(id);
    const errEl = document.getElementById(err);
    if (!el.value.trim()) {
      el.classList.add('has-error');
      errEl.textContent = msg;
      valid = false;
    } else {
      el.classList.remove('has-error');
      errEl.textContent = '';
    }
  });
  return valid;
}

async function submitForm() {
  if (!validateForm()) return;

  const btn = document.getElementById('form-modal-submit');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const body = {
    title:       document.getElementById('field-title').value.trim(),
    schoolId:    document.getElementById('field-school').value,
    date:        document.getElementById('field-date').value,
    startTime:   document.getElementById('field-start-time').value || null,
    endTime:     document.getElementById('field-end-time').value || null,
    location:    document.getElementById('field-location').value.trim() || null,
    isOnline:    document.getElementById('field-online').checked,
    description: document.getElementById('field-description').value.trim() || null,
  };

  try {
    let res;
    if (editingId) {
      res = await fetch(`/openhouses/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch('/openhouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Save failed');
    }

    const saved = await res.json();

    if (editingId) {
      allOpenHouses = allOpenHouses.map(oh => oh.id === editingId ? { ...oh, ...saved } : oh);
      showToast('Open house updated successfully', 'success');
    } else {
      allOpenHouses.push(saved);
      showToast('Open house added successfully', 'success');
    }

    closeFormModal();
    applyFiltersAndRender();
  } catch (err) {
    showToast(err.message || 'Failed to save open house', 'error');
    console.error('[admin-openhouses] save error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = editingId ? 'Save Changes' : 'Add Open House';
  }
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon-wrap">${type === 'success' ? '✅' : '❌'}</span>
    <span class="toast-msg">${escHtml(message)}</span>
    <button class="toast-close-btn" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 300ms';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Util ──────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}