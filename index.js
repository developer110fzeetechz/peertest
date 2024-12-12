const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const { globalRoom } = socket.handshake.query;
  if (globalRoom) {
    socket.join(globalRoom);
    console.log(`User ${socket.id} joined room ${globalRoom}`);
  }

  // Emit test event to the client for debugging
  socket.emit('test-event', { message: 'Hello from server!' });

  // Listen for call request
  socket.on('call-user', ({ to, offer }) => {
    console.log(`Call request from ${socket.id} to ${to}`);
    io.to(to).emit('incoming-call', { from: socket.id, offer });
  });

  // Listen for answer
  socket.on('call-accepted', ({ to, answer }) => {
    console.log(`Call accepted by ${socket.id}`);
    io.to(to).emit('call-answered', { from: socket.id, answer });
  });

  // Listen for ICE candidates
  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  // Listen for call rejection
  socket.on('call-rejected', ({ to }) => {
    console.log(`Call rejected by ${socket.id}`);
    io.to(to).emit('call-rejected', { from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
