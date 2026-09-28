// Global Application State & Controller
const socket = io();

const AppState = {
  users: [],
  tasks: [],
  activities: [],
  currentUser: null,
  activeTask: null,
  filters: {
    priority: '',
    label: '',
    assigneeId: '',
    search: ''
  }
};

let teamChatInstance = null;

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Helper: Toast Notifications
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Initial Boot
document.addEventListener('DOMContentLoaded', async () => {
  await loadUsers();
  await loadTasks();
  teamChatInstance = new TeamChat(socket);

  setupEventListeners();
  setupSocketListeners();
  lucide.createIcons();
});

// Load Users & Set Active Simulator
async function loadUsers() {
  AppState.users = await API.getUsers();
  AppState.currentUser = AppState.users[0] || { id: 'usr-1', name: 'Kanika Patil', avatar: 'KP', email: 'kanika.patil@example.com' };

  updateUserDisplay();

  // Populate Selects
  const switchSelect = document.getElementById('switchUserSelect');
  const newAssignee = document.getElementById('newAssignee');
  const modalAssignee = document.getElementById('modalAssigneeSelect');
  const assigneeFilter = document.getElementById('assigneeFilter');

  [switchSelect, newAssignee, modalAssignee, assigneeFilter].forEach(sel => sel.innerHTML = '');

  assigneeFilter.innerHTML = '<option value="">Everyone</option>';
  newAssignee.innerHTML = '<option value="">Unassigned</option>';
  modalAssignee.innerHTML = '<option value="">Unassigned</option>';

  AppState.users.forEach(u => {
    const opt = `<option value="${u.id}">${u.name} (${u.role || 'Member'})</option>`;
    switchSelect.innerHTML += opt;
    newAssignee.innerHTML += opt;
    modalAssignee.innerHTML += opt;
    assigneeFilter.innerHTML += opt;
  });

  switchSelect.value = AppState.currentUser.id;
}

function updateUserDisplay() {
  document.getElementById('currentUserName').textContent = AppState.currentUser.name;
  document.getElementById('currentUserAvatar').textContent = AppState.currentUser.avatar;
  const commenterAvatar = document.getElementById('commenterAvatar');
  if (commenterAvatar) commenterAvatar.textContent = AppState.currentUser.avatar;
}

// Fetch & Render Kanban Board
async function loadTasks() {
  AppState.tasks = await API.getTasks();
  renderBoard();
  populateLabelFilters();
}

function populateLabelFilters() {
  const labelSet = new Set();
  AppState.tasks.forEach(t => {
    if (t.labels) t.labels.forEach(l => labelSet.add(l));
  });

  const labelFilter = document.getElementById('labelFilter');
  const current = labelFilter.value;
  labelFilter.innerHTML = '<option value="">All Labels</option>';
  labelSet.forEach(l => {
    labelFilter.innerHTML += `<option value="${l}">${l}</option>`;
  });
  labelFilter.value = current;
}

// Filter Logic
function getFilteredTasks() {
  return AppState.tasks.filter(t => {
    if (AppState.filters.priority && t.priority !== AppState.filters.priority) return false;
    if (AppState.filters.label && (!t.labels || !t.labels.includes(AppState.filters.label))) return false;
    if (AppState.filters.assigneeId && (!t.assignee || t.assignee.id !== AppState.filters.assigneeId)) return false;
    if (AppState.filters.search) {
      const q = AppState.filters.search.toLowerCase();
      const match = t.title.toLowerCase().includes(q) ||
                    (t.description && t.description.toLowerCase().includes(q)) ||
                    t.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

function renderBoard() {
  const filtered = getFilteredTasks();

  const columns = {
    'To Do': document.getElementById('cards-todo'),
    'In Progress': document.getElementById('cards-inprogress'),
    'In Review': document.getElementById('cards-inreview'),
    'Done': document.getElementById('cards-done')
  };

  const counts = {
    'To Do': document.getElementById('count-todo'),
    'In Progress': document.getElementById('count-inprogress'),
    'In Review': document.getElementById('count-inreview'),
    'Done': document.getElementById('count-done')
  };

  // Clear columns
  Object.values(columns).forEach(col => col.innerHTML = '');

  const stats = { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0 };

  filtered.forEach(task => {
    const col = columns[task.status] || columns['To Do'];
    if (stats[task.status] !== undefined) stats[task.status]++;
    col.appendChild(createTaskCardElement(task));
  });

  // Update counts
  Object.keys(counts).forEach(k => counts[k].textContent = stats[k] || 0);
  document.getElementById('totalTasksBadge').textContent = filtered.length;

  lucide.createIcons();
}

function createTaskCardElement(task) {
  const card = document.createElement('div');
  card.className = `task-card priority-${task.priority}`;
  card.setAttribute('draggable', 'true');
  card.dataset.id = task.id;

  // Drag & Drop
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    card.style.opacity = '0.4';
  });
  card.addEventListener('dragend', () => {
    card.style.opacity = '1';
  });

  // Click to open detailed issue modal
  card.addEventListener('click', () => openIssueModal(task.id));

  const labelsHtml = (task.labels && task.labels.length)
    ? `<div class="task-labels">${task.labels.map(l => `<span class="label-tag">${escapeHtml(l)}</span>`).join('')}</div>`
    : '';

  const commentsCount = task.comments ? task.comments.length : 0;
  const attachmentsCount = task.attachments ? task.attachments.length : 0;

  card.innerHTML = `
    <div class="task-header">
      <span class="task-id">${task.id}</span>
      <span class="priority-badge ${task.priority}">${task.priority}</span>
    </div>
    <div class="task-title">${escapeHtml(task.title)}</div>
    ${labelsHtml}
    <div class="task-footer">
      <div class="task-meta-left">
        ${commentsCount > 0 ? `<span class="meta-icon-item" title="${commentsCount} comments"><i data-lucide="message-square" style="width:13px; height:13px;"></i> ${commentsCount}</span>` : ''}
        ${attachmentsCount > 0 ? `<span class="meta-icon-item" title="${attachmentsCount} files"><i data-lucide="paperclip" style="width:13px; height:13px;"></i> ${attachmentsCount}</span>` : ''}
        ${task.dueDate ? `<span class="meta-icon-item" title="Due Date"><i data-lucide="calendar" style="width:13px; height:13px;"></i> ${task.dueDate.substring(5)}</span>` : ''}
      </div>
      <div class="avatar sm" title="Assignee: ${task.assignee ? task.assignee.name : 'Unassigned'}">
        ${task.assignee ? task.assignee.avatar : '?'}
      </div>
    </div>
  `;

  return card;
}

// Kanban Drag and Drop Handlers
function handleDragOver(e) {
  e.preventDefault();
}

async function handleDrop(e, newStatus) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData('text/plain');
  if (!taskId) return;

  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task || task.status === newStatus) return;

  task.status = newStatus;
  renderBoard(); // Optimistic render

  await API.updateTask(taskId, {
    status: newStatus,
    user: AppState.currentUser.name
  });
}

// Detailed Issue Modal Management
async function openIssueModal(taskId) {
  const task = await API.getTask(taskId);
  if (!task) return;

  AppState.activeTask = task;
  document.getElementById('modalIssueKey').textContent = task.id;
  document.getElementById('modalIssueStatusBadge').textContent = task.status.toUpperCase();
  document.getElementById('modalTitle').textContent = task.title;
  document.getElementById('modalDescription').textContent = task.description || '';
  document.getElementById('modalStatusSelect').value = task.status;
  document.getElementById('modalPrioritySelect').value = task.priority;
  document.getElementById('modalAssigneeSelect').value = task.assignee ? task.assignee.id : '';
  document.getElementById('modalDueDateInput').value = task.dueDate || '';
  document.getElementById('modalLabelsInput').value = (task.labels || []).join(', ');
  document.getElementById('modalCreatedAt').textContent = new Date(task.createdAt).toLocaleString();
  document.getElementById('modalUpdatedAt').textContent = new Date(task.updatedAt).toLocaleString();

  renderModalComments(task.comments || []);
  renderModalAttachments(task.attachments || []);
  loadTaskActivities(task.id);

  // Reset tab to first
  switchModalTab('tabDetails');

  document.getElementById('issueModal').classList.add('open');
  lucide.createIcons();
}

function closeIssueModal() {
  document.getElementById('issueModal').classList.remove('open');
  AppState.activeTask = null;
}

function switchModalTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
}

function renderModalComments(comments) {
  const container = document.getElementById('modalCommentsList');
  container.innerHTML = '';
  if (!comments.length) {
    container.innerHTML = '<div style="font-size:13px; color:#6b778c; font-style:italic;">No comments yet. Start the conversation below.</div>';
    return;
  }

  comments.forEach(c => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.gap = '10px';
    item.innerHTML = `
      <div class="avatar sm">${c.author.avatar || 'TM'}</div>
      <div style="flex:1; background:#f4f5f7; padding:8px 12px; border-radius:6px; font-size:13px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="color:#172b4d;">${c.author.name}</strong>
          <span style="font-size:11px; color:#6b778c;">${new Date(c.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
        <div style="color:#253858; line-height:1.4;">${escapeHtml(c.text)}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderModalAttachments(attachments) {
  const container = document.getElementById('modalAttachmentsGrid');
  document.getElementById('modalAttCount').textContent = attachments.length;
  container.innerHTML = '';

  if (!attachments.length) {
    container.innerHTML = '<div style="font-size:13px; color:#6b778c; grid-column: 1 / -1; padding:12px 0;">No file attachments uploaded for this task.</div>';
    return;
  }

  attachments.forEach(att => {
    const card = document.createElement('div');
    card.className = 'attachment-card';
    card.innerHTML = `
      <div class="attachment-preview">
        ${att.isImage ? `<img src="${att.url}" alt="${escapeHtml(att.originalName)}">` : `<i data-lucide="file-text" style="width:32px; height:32px; color:#6b778c;"></i>`}
      </div>
      <div class="attachment-info">
        <div class="attachment-name" title="${escapeHtml(att.originalName)}">${escapeHtml(att.originalName)}</div>
        <div style="color:#6b778c; margin-top:2px;">${(att.size / 1024).toFixed(1)} KB</div>
        <a href="${att.url}" target="_blank" download style="color:#0052cc; text-decoration:none; font-weight:600; font-size:11px; margin-top:4px; display:inline-block;">Download</a>
      </div>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

async function loadTaskActivities(taskId) {
  const list = document.getElementById('modalTimelineList');
  list.innerHTML = '<div style="font-size:12px; color:#6b778c;">Loading activity timeline...</div>';

  const activities = await API.getActivities(taskId);
  list.innerHTML = '';

  if (!activities.length) {
    list.innerHTML = '<div style="font-size:13px; color:#6b778c; font-style:italic;">No historical updates recorded for this task.</div>';
    return;
  }

  activities.forEach(act => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    const timeFormatted = new Date(act.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) + ' ' + new Date(act.timestamp).toLocaleDateString();

    let changeDetails = '';
    if (act.from && act.to) {
      changeDetails = `<span style="color:#6b778c; text-decoration:line-through;">${act.from}</span> ? <strong>${act.to}</strong>`;
    } else if (act.details) {
      changeDetails = act.details;
    }

    item.innerHTML = `
      <div class="avatar sm" style="background:#505f79;">${act.user.substring(0, 2).toUpperCase()}</div>
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-user">${act.user}</span>
          <span class="timeline-time">${timeFormatted}</span>
        </div>
        <div class="timeline-action">
          <span style="font-weight:600;">${act.action}:</span> ${changeDetails}
        </div>
      </div>
    `;
    list.appendChild(item);
  });
}

// Global Activity Modal / Drawer handler
async function showGlobalActivity() {
  const activities = await API.getActivities();
  const summary = activities.slice(0, 8).map(a => `� ${a.user} ${a.action} on ${a.taskId}`).join('\n');
  alert('=== Recent Global Activity Trail ===\n\n' + summary);
}

// Create Task Modal
function openCreateModal() {
  document.getElementById('createModal').classList.add('open');
}
function closeCreateModal() {
  document.getElementById('createModal').classList.remove('open');
  document.getElementById('createTaskForm').reset();
}

// Event Listeners Binding
function setupEventListeners() {
  // Theme Toggle (Light & Dark Glassmorphism)
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeLabel = document.getElementById('themeLabel');
  const themeIcon = document.getElementById('themeIcon');
  
  const savedTheme = localStorage.getItem('teamflow_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('teamflow_theme', nextTheme);
      updateThemeButton(nextTheme);
      showToast(nextTheme === 'dark' ? '🌙 Dark Glass Theme activated' : '☀️ Light Glass Theme activated');
    });
  }

  function updateThemeButton(theme) {
    if (!themeLabel || !themeIcon) return;
    if (theme === 'dark') {
      themeLabel.textContent = 'Dark';
      themeIcon.setAttribute('data-lucide', 'moon');
      themeIcon.style.color = '#818cf8';
    } else {
      themeLabel.textContent = 'Light';
      themeIcon.setAttribute('data-lucide', 'sun');
      themeIcon.style.color = '#f59e0b';
    }
    lucide.createIcons();
  }

  // Navigation
  document.getElementById('openCreateTaskBtn').addEventListener('click', openCreateModal);
  document.getElementById('navActivityBtn').addEventListener('click', showGlobalActivity);

  // User Switcher
  document.getElementById('switchUserSelect').addEventListener('change', (e) => {
    const selected = AppState.users.find(u => u.id === e.target.value);
    if (selected) {
      AppState.currentUser = selected;
      updateUserDisplay();
      showToast('Switched persona to: ' + selected.name);
    }
  });

  // Filter Listeners
  document.getElementById('priorityFilter').addEventListener('change', (e) => {
    AppState.filters.priority = e.target.value;
    renderBoard();
  });
  document.getElementById('labelFilter').addEventListener('change', (e) => {
    AppState.filters.label = e.target.value;
    renderBoard();
  });
  document.getElementById('assigneeFilter').addEventListener('change', (e) => {
    AppState.filters.assigneeId = e.target.value;
    renderBoard();
  });
  document.getElementById('searchInput').addEventListener('input', (e) => {
    AppState.filters.search = e.target.value;
    renderBoard();
  });
  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    AppState.filters = { priority: '', label: '', assigneeId: '', search: '' };
    document.getElementById('priorityFilter').value = '';
    document.getElementById('labelFilter').value = '';
    document.getElementById('assigneeFilter').value = '';
    document.getElementById('searchInput').value = '';
    renderBoard();
  });

  // Create Task Form Submit
  document.getElementById('createTaskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('newTitle').value;
    const description = document.getElementById('newDescription').value;
    const priority = document.getElementById('newPriority').value;
    const assigneeId = document.getElementById('newAssignee').value;
    const labels = document.getElementById('newLabels').value;
    const dueDate = document.getElementById('newDueDate').value;

    const newTask = await API.createTask({
      title,
      description,
      priority,
      assigneeId,
      labels,
      dueDate,
      reporterName: AppState.currentUser.name
    });

    closeCreateModal();
    showToast('Task ' + newTask.id + ' created successfully!');
  });

  // Modal Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchModalTab(btn.dataset.tab));
  });

  // Modal Attribute Updates (Status, Priority, Assignee)
  document.getElementById('modalStatusSelect').addEventListener('change', async (e) => {
    if (!AppState.activeTask) return;
    const updated = await API.updateTask(AppState.activeTask.id, {
      status: e.target.value,
      user: AppState.currentUser.name
    });
    AppState.activeTask = updated;
    document.getElementById('modalIssueStatusBadge').textContent = updated.status.toUpperCase();
  });

  document.getElementById('modalPrioritySelect').addEventListener('change', async (e) => {
    if (!AppState.activeTask) return;
    const updated = await API.updateTask(AppState.activeTask.id, {
      priority: e.target.value,
      user: AppState.currentUser.name
    });
    AppState.activeTask = updated;
    showToast('Priority escalated: Email alert queued!');
  });

  document.getElementById('modalAssigneeSelect').addEventListener('change', async (e) => {
    if (!AppState.activeTask) return;
    const updated = await API.updateTask(AppState.activeTask.id, {
      assigneeId: e.target.value,
      user: AppState.currentUser.name
    });
    AppState.activeTask = updated;
    showToast('Reassigned task: Email alert queued!');
  });

  document.getElementById('modalDueDateInput').addEventListener('change', async (e) => {
    if (!AppState.activeTask) return;
    await API.updateTask(AppState.activeTask.id, {
      dueDate: e.target.value,
      user: AppState.currentUser.name
    });
  });

  document.getElementById('saveLabelsBtn').addEventListener('click', async () => {
    if (!AppState.activeTask) return;
    const raw = document.getElementById('modalLabelsInput').value;
    const labels = raw.split(',').map(s => s.trim()).filter(Boolean);
    const updated = await API.updateTask(AppState.activeTask.id, {
      labels,
      user: AppState.currentUser.name
    });
    AppState.activeTask = updated;
    showToast('Labels updated');
  });

  // Editable Title & Description
  const titleEl = document.getElementById('modalTitle');
  titleEl.addEventListener('blur', async () => {
    if (!AppState.activeTask) return;
    const newTitle = titleEl.textContent.trim();
    if (newTitle && newTitle !== AppState.activeTask.title) {
      await API.updateTask(AppState.activeTask.id, {
        title: newTitle,
        user: AppState.currentUser.name
      });
      showToast('Title updated');
    }
  });

  const descEl = document.getElementById('modalDescription');
  const saveDescBtn = document.getElementById('saveDescriptionBtn');
  descEl.addEventListener('input', () => {
    saveDescBtn.style.display = 'inline-block';
  });
  saveDescBtn.addEventListener('click', async () => {
    if (!AppState.activeTask) return;
    await API.updateTask(AppState.activeTask.id, {
      description: descEl.innerText.trim(),
      user: AppState.currentUser.name
    });
    saveDescBtn.style.display = 'none';
    showToast('Description saved');
  });

  // Delete Task
  document.getElementById('modalDeleteBtn').addEventListener('click', async () => {
    if (!AppState.activeTask) return;
    if (confirm(`Delete issue ${AppState.activeTask.id}? This action cannot be undone.`)) {
      await API.deleteTask(AppState.activeTask.id, AppState.currentUser.name);
      closeIssueModal();
      showToast('Task deleted');
    }
  });

  // Comment Submit
  document.getElementById('addCommentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!AppState.activeTask) return;
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text) return;

    await API.addComment(AppState.activeTask.id, {
      text,
      authorName: AppState.currentUser.name,
      authorAvatar: AppState.currentUser.avatar
    });

    input.value = '';
  });

  // File Upload Handlers (Dropzone & Browse)
  const dropzone = document.getElementById('attachmentDropzone');
  const fileInput = document.getElementById('fileInput');

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    if (!AppState.activeTask || !e.target.files.length) return;
    for (const file of e.target.files) {
      await API.uploadAttachment(AppState.activeTask.id, file, AppState.currentUser.name);
    }
    fileInput.value = '';
    showToast('File attached successfully!');
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#0052cc';
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '#b3d4ff';
  });
  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#b3d4ff';
    if (!AppState.activeTask || !e.dataTransfer.files.length) return;

    for (const file of e.dataTransfer.files) {
      await API.uploadAttachment(AppState.activeTask.id, file, AppState.currentUser.name);
    }
    showToast('Files uploaded successfully!');
  });
}

// Socket.io Real-Time Event Handlers for Global Collaboration
function setupSocketListeners() {
  socket.on('task:created', (newTask) => {
    AppState.tasks.unshift(newTask);
    renderBoard();
    populateLabelFilters();
    showToast(`? New Issue ${newTask.id} created`);
  });

  socket.on('task:updated', (updatedTask) => {
    const idx = AppState.tasks.findIndex(t => t.id === updatedTask.id);
    if (idx !== -1) {
      AppState.tasks[idx] = updatedTask;
      renderBoard();
      populateLabelFilters();
    }
    if (AppState.activeTask && AppState.activeTask.id === updatedTask.id) {
      AppState.activeTask = updatedTask;
      document.getElementById('modalIssueStatusBadge').textContent = updatedTask.status.toUpperCase();
    }
  });

  socket.on('task:deleted', ({ id }) => {
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    renderBoard();
    populateLabelFilters();
  });

  socket.on('task:commented', ({ taskId, comment }) => {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (task) {
      if (!task.comments) task.comments = [];
      task.comments.push(comment);
      renderBoard();
    }
    if (AppState.activeTask && AppState.activeTask.id === taskId) {
      renderModalComments(task.comments);
    }
  });

  socket.on('task:attachment_added', ({ taskId, attachment }) => {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (task) {
      if (!task.attachments) task.attachments = [];
      task.attachments.push(attachment);
      renderBoard();
    }
    if (AppState.activeTask && AppState.activeTask.id === taskId) {
      renderModalAttachments(task.attachments);
    }
  });

  socket.on('activity:created', (act) => {
    if (AppState.activeTask && AppState.activeTask.id === act.taskId) {
      loadTaskActivities(act.taskId);
    }
  });
}
