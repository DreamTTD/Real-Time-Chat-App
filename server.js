import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  path: '/socket.io',
});

const messages = [];

io.on('connection', (socket) => {
  let name = 'Guest';
  socket.on('set-name', (n) => {
    name = typeof n === 'string' && n.trim() ? n.trim().slice(0, 32) : 'Guest';
    socket.emit('system', `You joined as ${name}`);
    io.emit('presence', io.engine.clientsCount);
  });

  socket.on('join', () => {
    socket.join('lobby');
    io.to('lobby').emit('history', messages.slice(-100));
    io.emit('presence', io.engine.clientsCount);
  });

  socket.on('chat:message', (text) => {
    const t = typeof text === 'string' ? text.trim().slice(0, 2000) : '';
    if (!t) return;
    const msg = { id: `${Date.now()}-${socket.id}`, name, text: t, at: Date.now() };
    messages.push(msg);
    if (messages.length > 500) messages.shift();
    io.to('lobby').emit('chat:message', msg);
  });

  socket.on('disconnect', () => {
    io.emit('presence', io.engine.clientsCount);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => console.log(`[07-realtime-chat] http://localhost:${PORT}`));
