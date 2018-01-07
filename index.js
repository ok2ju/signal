const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  path: process.env.SIGNALING_PATH,
});
const debug = require('debug')('signal');

io.on('connection', (socket) => {
  debug('Received a new connection');

  socket.on('join', (room) => {
    debug(`User connected to room ${room}`);

    const peers = io.nsps['/'].adapter.rooms[room]
      ? Object.keys(io.nsps['/'].adapter.rooms[room].sockets)
      : [];

    socket.emit('peers', peers);
    socket.join(room);
  });

  socket.on('signal', (data) => {
    debug(`Received signal: id [${data.id}], signal [${data.signal}]`);

    const client = io.sockets.connected[data.id];
    client && client.emit('signal', {
      id: socket.id,
      signal: data.signal,
    });
  });
});

const port = process.env.PORT || 3334;
http.listen(port, () => {
  console.log('Signalling server listening on port:', port);
});