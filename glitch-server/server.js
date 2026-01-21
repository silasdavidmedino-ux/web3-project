// BJ Probability Engine - Live Sync Server
// Deploy this on Glitch.com

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients and game state
const rooms = new Map();

// Health check endpoint
app.get('/', (req, res) => {
  const roomCount = rooms.size;
  let totalClients = 0;
  rooms.forEach(room => totalClients += room.clients.size);

  res.send(`
    <html>
      <head><title>BJ Sync Server</title></head>
      <body style="font-family: Arial; padding: 20px; background: #1a1a2e; color: #fff;">
        <h1>🃏 BJ Probability Engine - Sync Server</h1>
        <p>Status: <span style="color: #0f0;">● Online</span></p>
        <p>Active Rooms: ${roomCount}</p>
        <p>Connected Clients: ${totalClients}</p>
        <hr>
        <p>To connect, use this server URL in your app.</p>
      </body>
    </html>
  `);
});

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.isAlive = true;
  ws.roomId = null;
  ws.userName = 'Anonymous';

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      switch (msg.type) {
        case 'join':
          handleJoin(ws, msg);
          break;
        case 'leave':
          handleLeave(ws);
          break;
        case 'sync':
          handleSync(ws, msg);
          break;
        case 'chat':
          handleChat(ws, msg);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  ws.on('close', () => {
    handleLeave(ws);
    console.log('Client disconnected');
  });
});

function handleJoin(ws, msg) {
  const roomId = msg.roomId || 'default';
  const userName = msg.userName || 'Player';

  // Leave current room if in one
  if (ws.roomId) {
    handleLeave(ws);
  }

  // Create room if doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      clients: new Set(),
      state: null,
      host: null
    });
  }

  const room = rooms.get(roomId);
  room.clients.add(ws);
  ws.roomId = roomId;
  ws.userName = userName;

  // First client becomes host
  if (!room.host) {
    room.host = ws;
    ws.isHost = true;
  }

  // Notify all clients in room
  const users = [];
  room.clients.forEach(client => {
    users.push({ name: client.userName, isHost: client.isHost || false });
  });

  broadcast(roomId, {
    type: 'userJoined',
    userName: userName,
    users: users,
    userCount: room.clients.size
  });

  // Send current state to new client
  if (room.state) {
    ws.send(JSON.stringify({
      type: 'sync',
      state: room.state,
      fromHost: true
    }));
  }

  // Confirm join
  ws.send(JSON.stringify({
    type: 'joined',
    roomId: roomId,
    isHost: ws.isHost || false,
    users: users
  }));

  console.log(`${userName} joined room ${roomId} (${room.clients.size} users)`);
}

function handleLeave(ws) {
  if (!ws.roomId) return;

  const room = rooms.get(ws.roomId);
  if (!room) return;

  room.clients.delete(ws);

  // If host left, assign new host
  if (ws.isHost && room.clients.size > 0) {
    const newHost = room.clients.values().next().value;
    newHost.isHost = true;
    room.host = newHost;
    newHost.send(JSON.stringify({ type: 'becameHost' }));
  }

  // Notify remaining clients
  const users = [];
  room.clients.forEach(client => {
    users.push({ name: client.userName, isHost: client.isHost || false });
  });

  broadcast(ws.roomId, {
    type: 'userLeft',
    userName: ws.userName,
    users: users,
    userCount: room.clients.size
  });

  // Delete empty rooms
  if (room.clients.size === 0) {
    rooms.delete(ws.roomId);
  }

  ws.roomId = null;
  ws.isHost = false;
}

function handleSync(ws, msg) {
  if (!ws.roomId) return;

  const room = rooms.get(ws.roomId);
  if (!room) return;

  // Update room state
  room.state = msg.state;

  // Broadcast to all other clients in room
  room.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'sync',
        state: msg.state,
        from: ws.userName
      }));
    }
  });
}

function handleChat(ws, msg) {
  if (!ws.roomId) return;

  broadcast(ws.roomId, {
    type: 'chat',
    from: ws.userName,
    message: msg.message,
    timestamp: Date.now()
  });
}

function broadcast(roomId, data) {
  const room = rooms.get(roomId);
  if (!room) return;

  const message = JSON.stringify(data);
  room.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Heartbeat to detect dead connections
const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) {
      handleLeave(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`BJ Sync Server running on port ${PORT}`);
});
