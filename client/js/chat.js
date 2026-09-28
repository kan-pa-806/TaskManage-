// Real-Time Chat System via Socket.io
class TeamChat {
  constructor(socket) {
    this.socket = socket;
    this.drawer = document.getElementById('chatDrawer');
    this.messagesContainer = document.getElementById('chatMessagesContainer');
    this.chatForm = document.getElementById('chatForm');
    this.chatInput = document.getElementById('chatInput');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.unreadBadge = document.getElementById('chatUnreadBadge');
    this.unreadCount = 0;
    this.isOpen = false;
    this.typingTimeout = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadHistory();

    // Socket Event Handlers
    this.socket.on('chat:new_message', (msg) => {
      this.appendMessage(msg);
      if (!this.isOpen) {
        this.unreadCount++;
        this.unreadBadge.style.display = 'inline-block';
        this.unreadBadge.textContent = this.unreadCount;
        showToast('?? ' + msg.sender.name + ': ' + msg.text.substring(0, 35));
      }
    });

    this.socket.on('chat:user_typing', (payload) => {
      if (this.typingIndicator) {
        this.typingIndicator.textContent = payload.userName + ' is typing...';
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
          this.typingIndicator.textContent = '';
        }, 2000);
      }
    });
  }

  bindEvents() {
    document.getElementById('toggleChatDrawerBtn').addEventListener('click', () => this.toggle());
    document.getElementById('navChatBtn').addEventListener('click', () => this.open());
    document.getElementById('closeChatBtn').addEventListener('click', () => this.close());

    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.chatInput.value.trim();
      if (!text) return;

      const user = AppState.currentUser;
      this.socket.emit('chat:send_message', {
        room: 'general',
        sender: { id: user.id, name: user.name, avatar: user.avatar },
        text
      });

      this.chatInput.value = '';
    });

    this.chatInput.addEventListener('input', () => {
      this.socket.emit('chat:typing', {
        room: 'general',
        userName: AppState.currentUser.name
      });
    });
  }

  async loadHistory() {
    try {
      const messages = await API.getMessages('general');
      this.messagesContainer.innerHTML = '';
      messages.forEach(msg => this.appendMessage(msg, false));
      this.scrollToBottom();
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  }

  appendMessage(msg, scroll = true) {
    const isMine = AppState.currentUser && AppState.currentUser.name === msg.sender.name;
    const item = document.createElement('div');
    item.className = 'chat-bubble' + (isMine ? ' mine' : '');

    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    item.innerHTML = `
      <div class="avatar sm">${msg.sender.avatar || 'U'}</div>
      <div class="msg-content">
        <div style="font-size:11px; font-weight:700; margin-bottom:2px; opacity:0.85;">
          ${msg.sender.name} � ${timeStr}
        </div>
        <div>${escapeHtml(msg.text)}</div>
      </div>
    `;

    this.messagesContainer.appendChild(item);
    if (scroll) this.scrollToBottom();
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.drawer.classList.add('open');
    this.unreadCount = 0;
    this.unreadBadge.style.display = 'none';
    this.scrollToBottom();
  }

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('open');
  }
}
