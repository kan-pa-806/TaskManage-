const API = {
  async getUsers() {
    const res = await fetch('/api/users');
    return res.json();
  },

  async getTasks(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch('/api/tasks' + (query ? '?' + query : ''));
    return res.json();
  },

  async getTask(id) {
    const res = await fetch('/api/tasks/' + id);
    return res.json();
  },

  async createTask(taskData) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return res.json();
  },

  async updateTask(id, updateData) {
    const res = await fetch('/api/tasks/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  async deleteTask(id, user) {
    const res = await fetch('/api/tasks/' + id + '?user=' + encodeURIComponent(user), {
      method: 'DELETE'
    });
    return res.json();
  },

  async addComment(taskId, commentData) {
    const res = await fetch('/api/tasks/' + taskId + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    return res.json();
  },

  async uploadAttachment(taskId, file, uploadedBy) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);

    const res = await fetch('/api/tasks/' + taskId + '/attachments', {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async getActivities(taskId = null) {
    const url = taskId ? '/api/activities?taskId=' + taskId : '/api/activities';
    const res = await fetch(url);
    return res.json();
  },

  async getMessages(room = 'general') {
    const res = await fetch('/api/messages?room=' + encodeURIComponent(room));
    return res.json();
  }
};
