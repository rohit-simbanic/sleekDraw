const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'ok', uptime: process.uptime() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory store for rooms
// Structure: { [roomId]: { encryptedElements: string, encryptedAppState: string } }
const rooms = new Map();

io.on('connection', (socket) => {
  let currentRoomId = null;

  // Join Room
  socket.on('join-room', ({ roomId }) => {
    currentRoomId = roomId;
    socket.join(roomId);

    // Send current encrypted room state if stored
    if (rooms.has(roomId)) {
      socket.emit('init-state', rooms.get(roomId));
    }
  });

  // Broadcast encrypted scene state (elements + appState) to all other room members
  socket.on('update-state', ({ roomId, encryptedElements, encryptedAppState }) => {
    // Store in-memory for subsequent joiners
    rooms.set(roomId, { encryptedElements, encryptedAppState });

    // Send updates to others
    socket.to(roomId).emit('state-changed', { encryptedElements, encryptedAppState });
  });

  // Ephemeral cursor movement syncing
  socket.on('cursor-move', ({ roomId, cursorData }) => {
    socket.to(roomId).emit('peer-cursor', {
      socketId: socket.id,
      ...cursorData
    });
  });

  // Handle client disconnection
  socket.on('disconnecting', () => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit('peer-disconnected', socket.id);
    }
  });

  socket.on('disconnect', () => {
    // Nothing extra needed
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Relay server running on port ${PORT}`);
});
