// ============================================================
//  admin-schools.js — Schools management page
// ============================================================

function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== 'admin') { window.location.href = 'index.html'; }
}
checkAdminAccess();

// ── State ────────────────────────────────────────────────────
let allSchools   = [];
let filtered     = [];
let sortCol      = 'name';
let sortDir      = 'asc';
let currentPage  = 1;
const PAGE_SIZE  = 10;
let editingId    = null; // null = adding new, string = editing existing

// ── Auth header helper ────────────────────────────────────────
// ADDED: all /admin/* routes require a Bearer token. Use this helper
// in every fetch() that hits an /admin/* endpoint.
function authHeaders(extra = {}) {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    ...extra,
  };
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  loadSchools();
  bindEvents();
});

// ── Auth helpers ─────────────────────────────────────────────
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

// ── Load schools from API ─────────────────────────────────────
async function loadSchools() {
  try {
    // ADDED: Authorization header — /admin/schools requires admin JWT
    const res = await fetch('/admin/schools', {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load');
    allSchools = await res.json();
    applyFiltersAndRender();
  } catch (err) {
    document.getElementById('schools-tbody').innerHTML = `
      <tr><td colspan="6" class="table-loading" style="color:var(--color-red-600);">
        Failed to load schools. Is the server running?
      </td></tr>`;
    console.error('[admin-schools] load error:', err);
  }
}

// ── Bind UI events ───────────────────────────────────────────
function bindEvents() {
  // Search + filters
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { currentPage = 1; applyFiltersAndRender(); }, 250);
  });
  document.getElementById('filter-type').addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('filter-location').addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('btn-clear-filters').addEventListener('click', clearFilters);

  // Sorting
  document.querySelectorAll('.schools-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortCol = col; sortDir = 'asc'; }
      currentPage = 1;
      applyFiltersAndRender();
    });
  });

  // Add new
  document.getElementById('btn-add-school').addEventListener('click', openAddModal);

  // Delete modal
  document.getElementById('modal-close').addEventListener('click', closeDeleteModal);
  document.getElementById('modal-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('modal-confirm').addEventListener('click', confirmDelete);

  // Form modal
  document.getElementById('form-modal-close').addEventListener('click', closeFormModal);
  document.getElementById('form-modal-cancel').addEventListener('click', closeFormModal);
  document.getElementById('form-modal-submit').addEventListener('click', submitSchoolForm);

  // Close modals on overlay click
  document.getElementById('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });
  document.getElementById('form-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeFormModal();
  });
}

// ── Filter + sort + paginate + render ────────────────────────
function applyFiltersAndRender() {
  const search = document.getElementById('search-input').value.trim().toLowerCase();
  const typeF  = document.getElementById('filter-type').value;
  const locF   = document.getElementById('filter-location').value;

  filtered = allSchools.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search) ||
      (s.shortName && s.shortName.toLowerCase().includes(search)) ||
      s.id.toLowerCase().includes(search);
    const matchType = !typeF || s.type === typeF;
    const matchLoc  = !locF  || (s.location && s.location.includes(locF));
    return matchSearch && matchType && matchLoc;
  });

  // Sort
  filtered.sort((a, b) => {
    let va, vb;
    if (sortCol === 'name')     { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
    else if (sortCol === 'type') { va = a.type.toLowerCase(); vb = b.type.toLowerCase(); }
    else if (sortCol === 'programs') { va = a._count?.programs ?? 0; vb = b._count?.programs ?? 0; }
    else { va = ''; vb = ''; }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Update sort icons
  document.querySelectorAll('.schools-table th.sortable').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.dataset.col === sortCol) th.classList.add('sort-' + sortDir);
  });

  renderTable();
  renderPagination();
  updateCountLabel();
}

function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-location').value = '';
  currentPage = 1;
  applyFiltersAndRender();
}

// ── Render table rows ─────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('schools-tbody');
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  if (page.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <p>${allSchools.length === 0 ? 'No schools found in the database.' : 'No schools match your filters.'}</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = page.map(s => `
    <tr>
      <td>
        <div class="school-name-cell">${escHtml(s.name)}</div>
        <div class="school-id">${escHtml(s.id)}</div>
      </td>
      <td><span class="type-badge type-${escHtml(s.type)}">${escHtml(s.type)}</span></td>
      <td>${escHtml(s.location || '—')}</td>
      <td>
        <span class="program-count">
          📚 ${s._count?.programs ?? 0}
        </span>
      </td>
      <td>
        ${s.website
          ? `<a class="website-link" href="${escHtml(s.website)}" target="_blank" rel="noopener">
               ${escHtml(s.website.replace(/^https?:\/\//, ''))}
             </a>`
          : `<span class="no-website">—</span>`}
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-edit" onclick="openEditModal('${escHtml(s.id)}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="action-btn action-btn-delete" onclick="openDeleteModal('${escHtml(s.id)}', '${escHtml(s.name)}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination() {
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(currentPage * PAGE_SIZE, filtered.length);

  document.getElementById('pagination-info').textContent =
    filtered.length === 0 ? '' : `Showing ${start}–${end} of ${filtered.length}`;

  const pag = document.getElementById('pagination');
  if (totalPages <= 1) { pag.innerHTML = ''; return; }

  let html = `
    <button class="pagination-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pagination-page ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }

  html += `
    <button class="pagination-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;

  pag.innerHTML = html;
}

function goPage(n) {
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (n < 1 || n > totalPages) return;
  currentPage = n;
  renderTable();
  renderPagination();
}

function updateCountLabel() {
  document.getElementById('schools-count-label').textContent =
    `${allSchools.length} school${allSchools.length !== 1 ? 's' : ''} in the system`;
}

// ── Delete modal ──────────────────────────────────────────────
let deleteTargetId = null;

function openDeleteModal(id, name) {
  deleteTargetId = id;
  document.getElementById('modal-school-name').textContent = name;
  document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const btn = document.getElementById('modal-confirm');
  btn.textContent = 'Deleting...';
  btn.disabled = true;

  try {
    // ADDED: Authorization header — /admin/* routes require admin JWT
    const res = await fetch(`/admin/schools/${deleteTargetId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Delete failed');
    allSchools = allSchools.filter(s => s.id !== deleteTargetId);
    closeDeleteModal();
    applyFiltersAndRender();
    showToast('School deleted successfully', 'success');
  } catch (err) {
    showToast('Failed to delete school', 'error');
    console.error('[admin-schools] delete error:', err);
  } finally {
    btn.textContent = 'Delete School';
    btn.disabled = false;
  }
}

// ── Add / Edit form modal ─────────────────────────────────────
function openAddModal() {
  editingId = null;
  document.getElementById('form-modal-title').textContent = 'Add New School';
  document.getElementById('form-modal-submit').textContent = 'Add School';
  clearForm();
  // Enable ID field for new schools
  document.getElementById('field-id').disabled = false;
  document.getElementById('form-modal').style.display = 'flex';
}

function openEditModal(id) {
  const school = allSchools.find(s => s.id === id);
  if (!school) return;
  editingId = id;
  document.getElementById('form-modal-title').textContent = 'Edit School';
  document.getElementById('form-modal-submit').textContent = 'Save Changes';
  clearForm();

  document.getElementById('field-id').value        = school.id;
  document.getElementById('field-id').disabled     = true; // can't change ID
  document.getElementById('field-name').value      = school.name;
  document.getElementById('field-shortname').value = school.shortName || '';
  document.getElementById('field-type').value      = school.type;
  document.getElementById('field-location').value  = school.location || '';
  document.getElementById('field-website').value   = school.website || '';

  document.getElementById('form-modal').style.display = 'flex';
}

function closeFormModal() {
  document.getElementById('form-modal').style.display = 'none';
  editingId = null;
  clearForm();
}

function clearForm() {
  ['field-id','field-name','field-shortname','field-type','field-location','field-website']
    .forEach(id => {
      const el = document.getElementById(id);
      el.value = '';
      el.classList.remove('has-error');
    });
  ['err-id','err-name','err-type','err-location'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function validateForm() {
  let valid = true;
  const fields = [
    { id: 'field-id',       err: 'err-id',       msg: 'ID is required',       skip: !!editingId },
    { id: 'field-name',     err: 'err-name',     msg: 'Name is required' },
    { id: 'field-type',     err: 'err-type',     msg: 'Type is required' },
    { id: 'field-location', err: 'err-location', msg: 'Location is required' },
  ];

  fields.forEach(({ id, err, msg, skip }) => {
    if (skip) return;
    const el = document.getElementById(id);
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

async function submitSchoolForm() {
  if (!validateForm()) return;

  const btn = document.getElementById('form-modal-submit');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const body = {
    name:      document.getElementById('field-name').value.trim(),
    shortName: document.getElementById('field-shortname').value.trim() || null,
    type:      document.getElementById('field-type').value,
    location:  document.getElementById('field-location').value.trim(),
    website:   document.getElementById('field-website').value.trim() || null,
  };

  try {
    let res, saved;

    if (editingId) {
      // PUT update — ADDED: Authorization header
      res = await fetch(`/admin/schools/${editingId}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
    } else {
      // POST create — ADDED: Authorization header
      body.id = document.getElementById('field-id').value.trim();
      res = await fetch('/admin/schools', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Save failed');
    }

    saved = await res.json();

    if (editingId) {
      // Update in-memory
      allSchools = allSchools.map(s => s.id === editingId ? { ...s, ...saved } : s);
      showToast('School updated successfully', 'success');
    } else {
      allSchools.push(saved);
      showToast('School added successfully', 'success');
    }

    closeFormModal();
    applyFiltersAndRender();

  } catch (err) {
    showToast(err.message || 'Failed to save school', 'error');
    console.error('[admin-schools] save error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = editingId ? 'Save Changes' : 'Add School';
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
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 300ms'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// ── Util ──────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}