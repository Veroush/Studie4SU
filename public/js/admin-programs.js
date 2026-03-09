// ============================================================
//  admin-programs.js — Programs management page
// ============================================================

function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== 'admin') { window.location.href = 'index.html'; }
}
checkAdminAccess();

// ── State ────────────────────────────────────────────────────
let allPrograms  = [];
let allSchools   = [];
let filtered     = [];
let sortCol      = 'name';
let sortDir      = 'asc';
let currentPage  = 1;
const PAGE_SIZE  = 10;
let editingId    = null; // null = adding new, string = editing existing
let deleteTargetId = null;

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  loadData();
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

// ── Load data from API ────────────────────────────────────────
async function loadData() {
  await Promise.all([loadSchools(), loadPrograms()]);
}

async function loadPrograms() {
  try {
    const res = await fetch('/admin/programs');
    if (!res.ok) throw new Error('Failed to load');
    allPrograms = await res.json();
    applyFiltersAndRender();
  } catch (err) {
    document.getElementById('programs-tbody').innerHTML = `
      <tr><td colspan="6" style="padding:40px 16px;text-align:center;color:var(--color-red-600);font-size:var(--text-sm);">
        Failed to load programs. Is the server running?
      </td></tr>`;
    console.error('[admin-programs] load error:', err);
  }
}

async function loadSchools() {
  try {
    const res = await fetch('/admin/schools');
    if (!res.ok) throw new Error('Failed to load schools');
    allSchools = await res.json();
    populateSchoolDropdowns();
  } catch (err) {
    console.error('[admin-programs] schools load error:', err);
  }
}

function populateSchoolDropdowns() {
  // Filter dropdown
  const filterSchool = document.getElementById('filter-school');
  filterSchool.innerHTML = '<option value="">All Schools</option>';
  allSchools.forEach(s => {
    filterSchool.innerHTML += `<option value="${escHtml(s.id)}">${escHtml(s.name)}</option>`;
  });

  // Form dropdown
  const fieldSchool = document.getElementById('field-school');
  fieldSchool.innerHTML = '<option value="">Select school...</option>';
  allSchools.forEach(s => {
    fieldSchool.innerHTML += `<option value="${escHtml(s.id)}">${escHtml(s.name)}</option>`;
  });
}

// ── Bind UI events ───────────────────────────────────────────
function bindEvents() {
  // Search + filters
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { currentPage = 1; applyFiltersAndRender(); }, 250);
  });
  document.getElementById('filter-school').addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('filter-level').addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('btn-clear-filters').addEventListener('click', clearFilters);

  // Sorting
  document.querySelectorAll('.programs-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortCol = col; sortDir = 'asc'; }
      currentPage = 1;
      applyFiltersAndRender();
    });
  });

  // Add new
  document.getElementById('btn-add-program').addEventListener('click', openAddModal);

  // Delete modal
  document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-modal-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-modal-confirm').addEventListener('click', confirmDelete);

  // Form modal
  document.getElementById('form-modal-close').addEventListener('click', closeFormModal);
  document.getElementById('form-modal-cancel').addEventListener('click', closeFormModal);
  document.getElementById('form-modal-submit').addEventListener('click', submitProgramForm);

  // Close modals on overlay click
  document.getElementById('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });
  document.getElementById('form-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeFormModal();
  });

  // Escape key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDeleteModal();
      closeFormModal();
    }
  });
}

// ── Filter + sort + paginate + render ────────────────────────
function applyFiltersAndRender() {
  const search  = document.getElementById('search-input').value.trim().toLowerCase();
  const schoolF = document.getElementById('filter-school').value;
  const levelF  = document.getElementById('filter-level').value;

  filtered = allPrograms.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search) ||
      (p.cluster && p.cluster.toLowerCase().includes(search)) ||
      (p.school && p.school.name.toLowerCase().includes(search));
    const matchSchool = !schoolF || p.schoolId === schoolF;
    const matchLevel  = !levelF  || (p.levelRequired && p.levelRequired === levelF);
    return matchSearch && matchSchool && matchLevel;
  });

  // Sort
  filtered.sort((a, b) => {
    let va, vb;
    if (sortCol === 'name')          { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
    else if (sortCol === 'school')   { va = (a.school?.name || '').toLowerCase(); vb = (b.school?.name || '').toLowerCase(); }
    else if (sortCol === 'cluster')  { va = (a.cluster || '').toLowerCase(); vb = (b.cluster || '').toLowerCase(); }
    else if (sortCol === 'levelRequired') { va = (a.levelRequired || '').toLowerCase(); vb = (b.levelRequired || '').toLowerCase(); }
    else { va = ''; vb = ''; }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Update sort icons
  document.querySelectorAll('.programs-table th.sortable').forEach(th => {
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
  document.getElementById('filter-level').value = '';
  currentPage = 1;
  applyFiltersAndRender();
}

// ── Render table rows ─────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('programs-tbody');
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  if (page.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          <p>${allPrograms.length === 0 ? 'No programs found in the database.' : 'No programs match your filters.'}</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = page.map(p => `
    <tr>
      <td>
        <div class="program-name-cell">${escHtml(p.name)}</div>
        <div class="program-id">${escHtml(p.id)}</div>
      </td>
      <td>${escHtml(p.school?.name || p.schoolId || '—')}</td>
      <td>${escHtml(p.cluster || '—')}</td>
      <td>${p.levelRequired
        ? `<span class="level-badge level-${escHtml(p.levelRequired)}">${escHtml(p.levelRequired)}</span>`
        : '—'}</td>
      <td>${escHtml(p.duration || '—')}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-edit" onclick="openEditModal('${escHtml(p.id)}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="action-btn action-btn-delete" onclick="openDeleteModal('${escHtml(p.id)}', '${escHtml(p.name)}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
  const pag  = document.getElementById('pagination');
  const info = document.getElementById('pagination-info');

  const start = Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length);
  const end   = Math.min(currentPage * PAGE_SIZE, filtered.length);
  info.textContent = filtered.length > 0
    ? `Showing ${start}–${end} of ${filtered.length} program${filtered.length !== 1 ? 's' : ''}`
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
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (n < 1 || n > totalPages) return;
  currentPage = n;
  renderTable();
  renderPagination();
}

function updateCountLabel() {
  document.getElementById('programs-count-label').textContent =
    `${allPrograms.length} program${allPrograms.length !== 1 ? 's' : ''} in the system`;
}

// ── Delete modal ──────────────────────────────────────────────
function openDeleteModal(id, name) {
  deleteTargetId = id;
  document.getElementById('modal-program-name').textContent = name;
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
    const res = await fetch(`/admin/programs/${deleteTargetId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Delete failed');
    }
    allPrograms = allPrograms.filter(p => p.id !== deleteTargetId);
    closeDeleteModal();
    applyFiltersAndRender();
    showToast('Program deleted successfully', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to delete program', 'error');
    console.error('[admin-programs] delete error:', err);
  } finally {
    btn.textContent = 'Delete Program';
    btn.disabled = false;
  }
}

// ── Add / Edit form modal ─────────────────────────────────────
function openAddModal() {
  editingId = null;
  document.getElementById('form-modal-title').textContent = 'Add New Program';
  document.getElementById('form-modal-submit').textContent = 'Add Program';
  clearForm();
  document.getElementById('field-id').disabled = false;
  document.getElementById('form-modal').style.display = 'flex';
}

function openEditModal(id) {
  const program = allPrograms.find(p => p.id === id);
  if (!program) return;
  editingId = id;
  document.getElementById('form-modal-title').textContent = 'Edit Program';
  document.getElementById('form-modal-submit').textContent = 'Save Changes';
  clearForm();

  document.getElementById('field-id').value          = program.id;
  document.getElementById('field-id').disabled       = true;
  document.getElementById('field-name').value        = program.name;
  document.getElementById('field-school').value      = program.schoolId || '';
  document.getElementById('field-cluster').value     = program.cluster || '';
  document.getElementById('field-level').value       = program.levelRequired || '';
  document.getElementById('field-duration').value    = program.duration || '';
  document.getElementById('field-tuition').value     = program.tuitionCost || '';
  document.getElementById('field-description').value = program.description || '';
  document.getElementById('field-careers').value     = program.careers || '';

  document.getElementById('form-modal').style.display = 'flex';
}

function closeFormModal() {
  document.getElementById('form-modal').style.display = 'none';
  editingId = null;
  clearForm();
}

function clearForm() {
  ['field-id','field-name','field-school','field-cluster','field-level',
   'field-duration','field-tuition','field-description','field-careers']
    .forEach(id => {
      const el = document.getElementById(id);
      el.value = '';
      el.classList.remove('has-error');
      el.disabled = false;
    });
  ['err-id','err-name','err-school'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function validateForm() {
  let valid = true;
  const checks = [
    { id: 'field-id',     err: 'err-id',     msg: 'Program ID is required', skip: !!editingId },
    { id: 'field-name',   err: 'err-name',   msg: 'Name is required' },
    { id: 'field-school', err: 'err-school', msg: 'School is required' },
  ];

  checks.forEach(({ id, err, msg, skip }) => {
    if (skip) return;
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

async function submitProgramForm() {
  if (!validateForm()) return;

  const btn = document.getElementById('form-modal-submit');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const body = {
    name:          document.getElementById('field-name').value.trim(),
    schoolId:      document.getElementById('field-school').value,
    cluster:       document.getElementById('field-cluster').value.trim() || null,
    levelRequired: document.getElementById('field-level').value || null,
    duration:      document.getElementById('field-duration').value.trim() || null,
    tuitionCost:   document.getElementById('field-tuition').value.trim() || null,
    description:   document.getElementById('field-description').value.trim() || null,
    careers:       document.getElementById('field-careers').value.trim() || null,
  };

  try {
    let res;

    if (editingId) {
      res = await fetch(`/admin/programs/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      body.id = document.getElementById('field-id').value.trim();
      res = await fetch('/admin/programs', {
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
      allPrograms = allPrograms.map(p => p.id === editingId ? { ...p, ...saved } : p);
      showToast('Program updated successfully', 'success');
    } else {
      allPrograms.push(saved);
      showToast('Program added successfully', 'success');
    }

    closeFormModal();
    applyFiltersAndRender();

  } catch (err) {
    showToast(err.message || 'Failed to save program', 'error');
    console.error('[admin-programs] save error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = editingId ? 'Save Changes' : 'Add Program';
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