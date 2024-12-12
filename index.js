const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],

    },
  
});

io.on('connection', (socket) => {
  // console.log('A user connected:', socket.id);

  const {gobalRoom} =socket.handshake.query
  if(gobalRoom) {
    socket.join(gobalRoom);
    console.log(`User ${socket.id} joined room ${gobalRoom}`);
  }
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

  // Listen for ICE candidate
  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
