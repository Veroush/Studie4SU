// ============================================================
//  admin-quiz.js — Quiz questions management page
// ============================================================

function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== 'admin') { window.location.href = 'index.html'; }
}
checkAdminAccess();

// ── State ────────────────────────────────────────────────────
let allQuestions     = [];
let editingId        = null; // null = adding new
let deleteTargetId   = null;
let answersTargetId  = null;
let answerCounter    = 0;

// ── Auth header helper ────────────────────────────────────────
// ADDED BY RAKSHA: all /admin/* routes require a Bearer token. Use this helper
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
  loadQuestions();
  bindEvents();
  initEditorWithDefaults();
});

// ── Auth ─────────────────────────────────────────────────────
function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function initAuth() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  const payload = decodeToken(token);
  if (payload?.name) document.getElementById('admin-name').textContent = payload.name;
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

// ── Load questions ────────────────────────────────────────────
async function loadQuestions() {
  try {
    // ADDED: Authorization header — /admin/quiz/questions requires admin JWT
    const res = await fetch('/admin/quiz/questions', {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    allQuestions = data;
    renderQuestions();
  } catch (err) {
    document.getElementById('questions-loading').innerHTML =
      `<span style="color:var(--color-red-600);">Failed to load questions. Is the server running?</span>`;
    console.error('[admin-quiz] load error:', err);
  }
}

// ── Render questions list ─────────────────────────────────────
function renderQuestions() {
  const list = document.getElementById('questions-list');

  if (allQuestions.length === 0) {
    list.innerHTML = `
      <div class="questions-empty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <p>No quiz questions yet. Click "Add Question" to create the first one.</p>
      </div>`;
    updateCountLabel();
    return;
  }

  list.innerHTML = '';
  allQuestions.forEach((q, idx) => {
    list.appendChild(createQuestionCard(q, idx + 1));
  });
  updateCountLabel();
}

function createQuestionCard(q, number) {
  const card = document.createElement('div');
  card.className = 'question-card';
  card.dataset.questionId = q.id;

  const typeLabel = q.type === 'multiple' ? 'Multiple Choice' : 'Single Choice';
  const answerCount = q.answers?.length ?? 0;
  const isEditing = editingId === q.id;

  card.innerHTML = `
    <div class="question-card-content">
      <div class="question-info">
        <div class="question-meta">
          <span class="question-number">Question ${number}</span>
          <span class="question-type-badge ${isEditing ? 'active' : ''}">${escHtml(typeLabel)}</span>
        </div>
        <p class="question-text">${escHtml(q.text)}</p>
        <p class="question-answer-count">${answerCount} answer option${answerCount !== 1 ? 's' : ''} configured</p>
      </div>
      <div class="question-actions">
        <button class="btn-secondary btn-edit-q" data-id="${escHtml(q.id)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn-secondary btn-manage-q" data-id="${escHtml(q.id)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Answers
        </button>
        <button class="btn-secondary btn-delete-q" data-id="${escHtml(q.id)}" style="color:var(--color-red-600);border-color:#fecaca;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          Delete
        </button>
      </div>
    </div>`;

  card.querySelector('.btn-edit-q').addEventListener('click', () => openEditor(q.id));
  card.querySelector('.btn-manage-q').addEventListener('click', () => openAnswersModal(q.id));
  card.querySelector('.btn-delete-q').addEventListener('click', () => openDeleteModal(q.id, q.text));

  return card;
}

function updateCountLabel() {
  document.getElementById('quiz-count-label').textContent =
    `${allQuestions.length} question${allQuestions.length !== 1 ? 's' : ''} in the quiz`;
}

// ── Editor ────────────────────────────────────────────────────
function initEditorWithDefaults() {
  // Pre-populate 2 blank answer rows so the editor is ready on first open
  addAnswerOption();
  addAnswerOption();
}

function openAddMode() {
  editingId = null;
  document.getElementById('editor-title').textContent = 'New Question';
  document.getElementById('save-question-btn').textContent = 'Add Question';
  clearEditor();
  showEditor();
  setTimeout(() => document.getElementById('question-text').focus(), 300);
}

function openEditor(id) {
  const q = allQuestions.find(x => x.id === id);
  if (!q) return;

  editingId = id;
  document.getElementById('editor-title').textContent = 'Edit Question';
  document.getElementById('save-question-btn').textContent = 'Save Changes';

  // Populate fields
  document.getElementById('question-text').value = q.text;
  document.getElementById('question-type').value = q.type;

  // Populate answers
  document.getElementById('answer-options-list').innerHTML = '';
  answerCounter = 0;
  (q.answers || []).forEach(a => {
    const row = addAnswerOption();
    row.querySelector('.answer-option-input').value = a.text || '';
    row.querySelector('.answer-option-link').value  = a.programLink || '';
  });
  // Ensure at least 2
  while (document.querySelectorAll('.answer-option-row').length < 2) addAnswerOption();

  // Highlight the card being edited
  document.querySelectorAll('.question-card').forEach(c => c.classList.remove('is-editing'));
  const editCard = document.querySelector(`[data-question-id="${id}"]`);
  if (editCard) {
    editCard.classList.add('is-editing');
    editCard.querySelector('.question-type-badge')?.classList.add('active');
  }

  clearFieldErrors();
  showEditor();
  document.getElementById('editor-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => document.getElementById('question-text').focus(), 400);
}

function showEditor() {
  document.getElementById('editor-section').style.display = 'block';
}

function hideEditor() {
  document.getElementById('editor-section').style.display = 'none';
  document.querySelectorAll('.question-card').forEach(c => {
    c.classList.remove('is-editing');
    const badge = c.querySelector('.question-type-badge');
    if (badge) badge.classList.remove('active');
  });
}

function clearEditor() {
  document.getElementById('question-text').value = '';
  document.getElementById('question-type').value = '';
  document.getElementById('answer-options-list').innerHTML = '';
  answerCounter = 0;
  addAnswerOption();
  addAnswerOption();
  clearFieldErrors();
}

// ── Answer option rows ────────────────────────────────────────
const CLUSTER_OPTIONS = [
  { value: '',            label: 'Link to cluster...' },
  { value: 'Technologie', label: 'Technologie' },
  { value: 'Economie',    label: 'Economie' },
  { value: 'Gezondheid',  label: 'Gezondheid' },
  { value: 'Onderwijs',   label: 'Onderwijs' },
  { value: 'Recht',       label: 'Recht' },
  { value: 'Kunst',       label: 'Kunst & Design' },
  { value: 'Natuur',      label: 'Natuur & Landbouw' },
  { value: 'Overig',      label: 'Overig' },
];

function addAnswerOption() {
  answerCounter++;
  const id = answerCounter;
  const list = document.getElementById('answer-options-list');

  const row = document.createElement('div');
  row.className = 'answer-option-row';
  row.dataset.optionId = id;

  const opts = CLUSTER_OPTIONS.map(o =>
    `<option value="${escHtml(o.value)}">${escHtml(o.label)}</option>`
  ).join('');

  row.innerHTML = `
    <input
      type="text"
      class="answer-option-input"
      placeholder="Answer option ${id}"
      aria-label="Answer option ${id}"
    />
    <select class="answer-option-link" aria-label="Link answer to cluster">${opts}</select>
    <button type="button" class="answer-option-remove" aria-label="Remove answer option ${id}">Remove</button>`;

  row.querySelector('.answer-option-remove').addEventListener('click', () => {
    const rows = document.querySelectorAll('.answer-option-row');
    if (rows.length <= 2) {
      showToast('A question must have at least 2 answer options', 'warning');
      return;
    }
    row.remove();
    renumberPlaceholders();
  });

  list.appendChild(row);
  return row;
}

function renumberPlaceholders() {
  document.querySelectorAll('.answer-option-input').forEach((input, i) => {
    input.placeholder = `Answer option ${i + 1}`;
    input.setAttribute('aria-label', `Answer option ${i + 1}`);
  });
}

// ── Save question ─────────────────────────────────────────────
async function saveQuestion() {
  if (!validateEditor()) return;

  const btn = document.getElementById('save-question-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const answers = [];
  document.querySelectorAll('.answer-option-row').forEach((row, i) => {
    const text = row.querySelector('.answer-option-input').value.trim();
    const link = row.querySelector('.answer-option-link').value;
    if (text) answers.push({ text, programLink: link || null, order: i + 1 });
  });

  const body = {
    text:    document.getElementById('question-text').value.trim(),
    type:    document.getElementById('question-type').value,
    answers,
  };

  try {
    let res;
    if (editingId) {
      // ADDED: Authorization header — /admin/* routes require admin JWT
      res = await fetch(`/admin/quiz/questions/${editingId}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
    } else {
      // ADDED BY RAKSHA: Authorization header — /admin/* routes require admin JWT
      res = await fetch('/admin/quiz/questions', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Save failed');
    }

    const saved = await res.json();

    if (editingId) {
      allQuestions = allQuestions.map(q => q.id === editingId ? saved : q);
      showToast('Question updated successfully', 'success');
    } else {
      allQuestions.push(saved);
      showToast('Question added successfully', 'success');
    }

    hideEditor();
    editingId = null;
    renderQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    showToast(err.message || 'Failed to save question', 'error');
    console.error('[admin-quiz] save error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = editingId ? 'Save Changes' : 'Add Question';
  }
}

function validateEditor() {
  let valid = true;

  const text = document.getElementById('question-text').value.trim();
  const errText = document.getElementById('err-question-text');
  const textEl  = document.getElementById('question-text');
  if (text.length < 5) {
    errText.textContent = 'Question text must be at least 5 characters.';
    textEl.classList.add('has-error');
    valid = false;
  } else {
    errText.textContent = '';
    textEl.classList.remove('has-error');
  }

  const type = document.getElementById('question-type').value;
  const errType = document.getElementById('err-question-type');
  const typeEl  = document.getElementById('question-type');
  if (!type) {
    errType.textContent = 'Please select a question type.';
    typeEl.classList.add('has-error');
    valid = false;
  } else {
    errType.textContent = '';
    typeEl.classList.remove('has-error');
  }

  const filledAnswers = [...document.querySelectorAll('.answer-option-input')]
    .filter(i => i.value.trim()).length;
  const errAnswers = document.getElementById('err-answers');
  if (filledAnswers < 2) {
    errAnswers.textContent = 'Please provide at least 2 filled answer options.';
    valid = false;
  } else {
    errAnswers.textContent = '';
  }

  return valid;
}

function clearFieldErrors() {
  document.getElementById('err-question-text').textContent = '';
  document.getElementById('err-question-type').textContent = '';
  document.getElementById('err-answers').textContent = '';
  document.getElementById('question-text').classList.remove('has-error');
  document.getElementById('question-type').classList.remove('has-error');
}

// ── Delete modal ──────────────────────────────────────────────
function openDeleteModal(id, text) {
  deleteTargetId = id;
  // Show first 60 chars of question as preview
  const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;
  document.getElementById('modal-question-preview').textContent = `"${preview}"`;
  document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const btn = document.getElementById('delete-modal-confirm');
  btn.disabled = true;
  btn.textContent = 'Deleting...';

  try {
    // ADDED: Authorization header — /admin/* routes require admin JWT
    const res = await fetch(`/admin/quiz/questions/${deleteTargetId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Delete failed');
    }
    allQuestions = allQuestions.filter(q => q.id !== deleteTargetId);
    // If we were editing this question, hide the editor
    if (editingId === deleteTargetId) { hideEditor(); editingId = null; }
    closeDeleteModal();
    renderQuestions();
    showToast('Question deleted successfully', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to delete question', 'error');
    console.error('[admin-quiz] delete error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete Question';
  }
}

// ── Manage Answers modal ──────────────────────────────────────
function openAnswersModal(id) {
  const q = allQuestions.find(x => x.id === id);
  if (!q) return;
  answersTargetId = id;

  document.getElementById('modal-question-text').textContent = q.text;

  const list = document.getElementById('modal-answers-list');
  list.innerHTML = '';
  (q.answers || []).forEach(a => list.appendChild(createAnswerItem(a)));

  document.getElementById('answers-modal').style.display = 'flex';
}

function closeAnswersModal() {
  answersTargetId = null;
  document.getElementById('answers-modal').style.display = 'none';
}

function createAnswerItem(answer) {
  const item = document.createElement('div');
  item.className = 'answer-item';
  item.dataset.answerId = answer.id ?? '';

  const opts = CLUSTER_OPTIONS.map(o =>
    `<option value="${escHtml(o.value)}" ${answer.programLink === o.value ? 'selected' : ''}>${escHtml(o.label)}</option>`
  ).join('');

  item.innerHTML = `
    <div class="answer-item-handle" aria-hidden="true">☰</div>
    <input type="text" class="answer-item-input" value="${escHtml(answer.text || '')}" placeholder="Answer text" />
    <select class="answer-item-link">${opts}</select>
    <button type="button" class="answer-item-remove" aria-label="Remove answer">✕</button>`;

  item.querySelector('.answer-item-remove').addEventListener('click', () => {
    const items = document.querySelectorAll('#modal-answers-list .answer-item');
    if (items.length <= 2) {
      showToast('A question must have at least 2 answers', 'warning');
      return;
    }
    item.remove();
  });

  return item;
}

function addModalAnswer() {
  const list = document.getElementById('modal-answers-list');
  const newItem = createAnswerItem({ id: null, text: '', programLink: '' });
  list.appendChild(newItem);
  newItem.querySelector('.answer-item-input').focus();
}

async function saveAnswers() {
  const items = document.querySelectorAll('#modal-answers-list .answer-item');
  const answers = [];
  items.forEach((item, i) => {
    const text = item.querySelector('.answer-item-input').value.trim();
    const link = item.querySelector('.answer-item-link').value;
    if (text) answers.push({ text, programLink: link || null, order: i + 1 });
  });

  if (answers.length < 2) {
    showToast('A question must have at least 2 answers', 'error');
    return;
  }

  const btn = document.getElementById('answers-modal-save');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    // ADDED BY RAKSHA: Authorization header — /admin/* routes require admin JWT
    const res = await fetch(`/admin/quiz/questions/${answersTargetId}/answers`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Save failed');
    }
    const saved = await res.json();
    allQuestions = allQuestions.map(q => q.id === answersTargetId ? saved : q);
    closeAnswersModal();
    renderQuestions();
    showToast('Answers updated successfully', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to save answers', 'error');
    console.error('[admin-quiz] save answers error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}

// ── Bind events ───────────────────────────────────────────────
function bindEvents() {
  document.getElementById('btn-add-question').addEventListener('click', openAddMode);
  document.getElementById('save-question-btn').addEventListener('click', saveQuestion);
  document.getElementById('cancel-editor-btn').addEventListener('click', () => {
    hideEditor();
    editingId = null;
  });
  document.getElementById('add-answer-btn').addEventListener('click', () => {
    const row = addAnswerOption();
    row.querySelector('.answer-option-input').focus();
  });

  // Delete modal
  document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-modal-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-modal-confirm').addEventListener('click', confirmDelete);
  document.getElementById('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });

  // Answers modal
  document.getElementById('answers-modal-close').addEventListener('click', closeAnswersModal);
  document.getElementById('answers-modal-cancel').addEventListener('click', closeAnswersModal);
  document.getElementById('answers-modal-save').addEventListener('click', saveAnswers);
  document.getElementById('modal-add-answer').addEventListener('click', addModalAnswer);
  document.getElementById('answers-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAnswersModal();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDeleteModal();
      closeAnswersModal();
      if (document.getElementById('editor-section').style.display !== 'none') {
        hideEditor();
        editingId = null;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (document.getElementById('editor-section').style.display !== 'none') {
        saveQuestion();
      }
    }
  });
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon-wrap">${icons[type] || '✅'}</span>
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