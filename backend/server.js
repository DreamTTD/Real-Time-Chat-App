
const io = require('socket.io')(3001, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('sendMessage', (msg) => {
    socket.broadcast.emit('receiveMessage', msg);
  });
});
