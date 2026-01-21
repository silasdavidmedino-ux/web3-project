// ============================================
// LIVE SYNC MODULE v1.0
// Real-time game state sharing via WebSocket
// ============================================

const LiveSync = {
  ws: null,
  serverUrl: null,
  roomId: null,
  userName: null,
  isHost: false,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 2000,
  syncEnabled: true,
  lastSyncTime: 0,
  syncThrottle: 100, // ms between syncs

  // Initialize connection
  connect(serverUrl, roomId, userName) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.serverUrl = serverUrl;
    this.roomId = roomId || 'default';
    this.userName = userName || 'Player';
    this.reconnectAttempts = 0;

    this._createConnection();
  },

  _createConnection() {
    try {
      // Convert HTTP to WS URL
      let wsUrl = this.serverUrl;
      if (wsUrl.startsWith('https://')) {
        wsUrl = wsUrl.replace('https://', 'wss://');
      } else if (wsUrl.startsWith('http://')) {
        wsUrl = wsUrl.replace('http://', 'ws://');
      } else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        wsUrl = 'wss://' + wsUrl;
      }

      console.log('[LiveSync] Connecting to:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[LiveSync] Connected!');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._updateStatus('connected');

        // Join room
        this.ws.send(JSON.stringify({
          type: 'join',
          roomId: this.roomId,
          userName: this.userName
        }));
      };

      this.ws.onmessage = (event) => {
        this._handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('[LiveSync] Disconnected');
        this.isConnected = false;
        this.isHost = false;
        this._updateStatus('disconnected');
        this._attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[LiveSync] Error:', error);
        this._updateStatus('error');
      };

    } catch (err) {
      console.error('[LiveSync] Connection failed:', err);
      this._updateStatus('error');
    }
  },

  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[LiveSync] Max reconnect attempts reached');
      this._updateStatus('failed');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[LiveSync] Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    this._updateStatus('reconnecting');

    setTimeout(() => {
      if (!this.isConnected && this.serverUrl) {
        this._createConnection();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  },

  _handleMessage(msg) {
    switch (msg.type) {
      case 'joined':
        this.isHost = msg.isHost;
        this._updateUsers(msg.users);
        showToast(`Joined room: ${msg.roomId} ${msg.isHost ? '(Host)' : ''}`, 'success');
        break;

      case 'becameHost':
        this.isHost = true;
        showToast('You are now the host!', 'info');
        this._updateStatus('connected');
        break;

      case 'userJoined':
        showToast(`${msg.userName} joined (${msg.userCount} online)`, 'info');
        this._updateUsers(msg.users);
        // If we're host, send current state to new user
        if (this.isHost) {
          this.syncState();
        }
        break;

      case 'userLeft':
        showToast(`${msg.userName} left (${msg.userCount} online)`, 'info');
        this._updateUsers(msg.users);
        break;

      case 'sync':
        if (this.syncEnabled && msg.state) {
          this._applyState(msg.state);
          console.log('[LiveSync] State synced from:', msg.from || 'host');
        }
        break;

      case 'chat':
        this._showChat(msg.from, msg.message);
        break;

      case 'pong':
        // Server responded to ping
        break;
    }
  },

  // Sync current game state to all connected clients
  syncState() {
    if (!this.isConnected || !this.ws) return;

    // Throttle syncs
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncThrottle) return;
    this.lastSyncTime = now;

    const state = this._getState();

    this.ws.send(JSON.stringify({
      type: 'sync',
      state: state
    }));
  },

  // Get current game state to sync
  _getState() {
    return {
      // Card counts
      rankCounts: { ...AppState.rankCounts },
      rankSeen: { ...AppState.rankSeen },
      cardsDealt: AppState.cardsDealt,
      runningCount: AppState.runningCount,

      // Positions
      positions: {
        dealer: [...(AppState.positions.dealer || [])],
        player1: [...(AppState.positions.player1 || [])],
        player2: [...(AppState.positions.player2 || [])],
        player3: [...(AppState.positions.player3 || [])],
        player4: [...(AppState.positions.player4 || [])],
        player5: [...(AppState.positions.player5 || [])]
      },

      // Decisions
      playerDecisions: { ...AppState.playerDecisions },

      // Settings
      numDecks: AppState.numDecks,
      numPlayers: AppState.numPlayers,

      // Timestamp
      syncTime: Date.now()
    };
  },

  // Apply received state
  _applyState(state) {
    if (!state) return;

    // Update card counts
    if (state.rankCounts) AppState.rankCounts = { ...state.rankCounts };
    if (state.rankSeen) AppState.rankSeen = { ...state.rankSeen };
    if (state.cardsDealt !== undefined) AppState.cardsDealt = state.cardsDealt;
    if (state.runningCount !== undefined) AppState.runningCount = state.runningCount;

    // Update positions
    if (state.positions) {
      AppState.positions.dealer = [...(state.positions.dealer || [])];
      for (let i = 1; i <= 5; i++) {
        AppState.positions[`player${i}`] = [...(state.positions[`player${i}`] || [])];
      }
    }

    // Update decisions
    if (state.playerDecisions) {
      AppState.playerDecisions = { ...state.playerDecisions };
    }

    // Update UI
    if (typeof updateAll === 'function') {
      updateAll();
    }
  },

  // Send chat message
  sendChat(message) {
    if (!this.isConnected || !this.ws) return;

    this.ws.send(JSON.stringify({
      type: 'chat',
      message: message
    }));
  },

  _showChat(from, message) {
    // Show chat in console and toast
    console.log(`[Chat] ${from}: ${message}`);
    showToast(`💬 ${from}: ${message}`, 'info');
  },

  _updateStatus(status) {
    const indicator = document.getElementById('syncStatus');
    const text = document.getElementById('syncStatusText');

    if (indicator) {
      indicator.className = 'sync-status ' + status;
    }
    if (text) {
      const statusText = {
        'connected': `🟢 Connected${this.isHost ? ' (Host)' : ''}`,
        'disconnected': '🔴 Disconnected',
        'reconnecting': '🟡 Reconnecting...',
        'error': '🔴 Error',
        'failed': '🔴 Connection failed'
      };
      text.textContent = statusText[status] || status;
    }
  },

  _updateUsers(users) {
    const list = document.getElementById('syncUsersList');
    if (!list) return;

    list.innerHTML = users.map(u =>
      `<span class="sync-user ${u.isHost ? 'host' : ''}">${u.name}${u.isHost ? ' ★' : ''}</span>`
    ).join('');
  },

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isHost = false;
    this._updateStatus('disconnected');
  },

  // Toggle sync receiving
  toggleSync(enabled) {
    this.syncEnabled = enabled;
    showToast(`Sync ${enabled ? 'enabled' : 'disabled'}`, 'info');
  }
};

// Auto-sync on state changes (call this after card deals, etc.)
function triggerLiveSync() {
  if (LiveSync.isConnected) {
    LiveSync.syncState();
  }
}

// Initialize sync UI
function initLiveSyncUI() {
  const controlsArea = document.querySelector('.controls-section') || document.body;

  const syncPanel = document.createElement('div');
  syncPanel.id = 'liveSyncPanel';
  syncPanel.className = 'live-sync-panel';
  syncPanel.innerHTML = `
    <div class="sync-header" onclick="toggleSyncPanel()">
      <span>📡 LIVE SYNC</span>
      <span id="syncStatus" class="sync-status disconnected"></span>
    </div>
    <div class="sync-body" id="syncBody" style="display: none;">
      <div class="sync-row">
        <label>Server URL:</label>
        <input type="text" id="syncServerUrl" placeholder="your-app.glitch.me" value="">
      </div>
      <div class="sync-row">
        <label>Room ID:</label>
        <input type="text" id="syncRoomId" placeholder="room-123" value="default">
      </div>
      <div class="sync-row">
        <label>Your Name:</label>
        <input type="text" id="syncUserName" placeholder="Player1" value="Player">
      </div>
      <div class="sync-buttons">
        <button onclick="connectLiveSync()" class="sync-btn connect">Connect</button>
        <button onclick="LiveSync.disconnect()" class="sync-btn disconnect">Disconnect</button>
      </div>
      <div class="sync-row">
        <span id="syncStatusText">🔴 Disconnected</span>
      </div>
      <div class="sync-users" id="syncUsersList"></div>
      <div class="sync-row">
        <input type="text" id="syncChatInput" placeholder="Send message..." onkeypress="if(event.key==='Enter')sendSyncChat()">
        <button onclick="sendSyncChat()" class="sync-btn small">Send</button>
      </div>
    </div>
  `;

  // Add to page
  document.body.appendChild(syncPanel);

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .live-sync-panel {
      position: fixed;
      top: 10px;
      right: 10px;
      width: 280px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid #0f3460;
      border-radius: 10px;
      font-family: 'Segoe UI', sans-serif;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .sync-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background: linear-gradient(90deg, #0f3460, #1a1a2e);
      border-radius: 10px 10px 0 0;
      cursor: pointer;
      color: #e94560;
      font-weight: bold;
    }
    .sync-status {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #666;
    }
    .sync-status.connected { background: #0f0; box-shadow: 0 0 10px #0f0; }
    .sync-status.disconnected { background: #f00; }
    .sync-status.reconnecting { background: #ff0; animation: pulse 1s infinite; }
    .sync-status.error { background: #f00; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .sync-body {
      padding: 15px;
    }
    .sync-row {
      margin-bottom: 10px;
    }
    .sync-row label {
      display: block;
      color: #aaa;
      font-size: 11px;
      margin-bottom: 3px;
    }
    .sync-row input {
      width: 100%;
      padding: 8px;
      border: 1px solid #0f3460;
      border-radius: 5px;
      background: #0a0a1a;
      color: #fff;
      font-size: 12px;
    }
    .sync-buttons {
      display: flex;
      gap: 10px;
      margin: 10px 0;
    }
    .sync-btn {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
    }
    .sync-btn.connect { background: #0f0; color: #000; }
    .sync-btn.disconnect { background: #f00; color: #fff; }
    .sync-btn.small { flex: 0; padding: 8px 15px; background: #0f3460; color: #fff; }
    .sync-btn:hover { opacity: 0.8; }
    .sync-users {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin: 10px 0;
    }
    .sync-user {
      background: #0f3460;
      padding: 3px 8px;
      border-radius: 10px;
      font-size: 11px;
      color: #fff;
    }
    .sync-user.host { background: #e94560; }
    #syncStatusText {
      color: #aaa;
      font-size: 12px;
    }
  `;
  document.head.appendChild(style);
}

function toggleSyncPanel() {
  const body = document.getElementById('syncBody');
  if (body) {
    body.style.display = body.style.display === 'none' ? 'block' : 'none';
  }
}

function connectLiveSync() {
  const url = document.getElementById('syncServerUrl').value.trim();
  const room = document.getElementById('syncRoomId').value.trim() || 'default';
  const name = document.getElementById('syncUserName').value.trim() || 'Player';

  if (!url) {
    showToast('Enter server URL!', 'warning');
    return;
  }

  LiveSync.connect(url, room, name);
}

function sendSyncChat() {
  const input = document.getElementById('syncChatInput');
  if (input && input.value.trim()) {
    LiveSync.sendChat(input.value.trim());
    input.value = '';
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLiveSyncUI);
} else {
  initLiveSyncUI();
}

console.log('[LiveSync] Module loaded');
