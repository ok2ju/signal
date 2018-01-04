#!/usr/bin/env node

const program = require('commander');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const pkg = require('../package.json');

program
  .version(pkg.version)
  .option('-p, --port [number]', 'Server port')
  .parse(process.argv);

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    const peers = io.nsps['/'].adapter.rooms[room]
      ? Object.keys(io.nsps['/'].adapter.rooms[room].sockets)
      : [];

    socket.emit('peers', peers);
    socket.join(room);
  });

  socket.on('signal', (data) => {
    const client = io.sockets.connected[data.id];
    client && client.emit('signal', {
      id: socket.id,
      signal: data.signal,
    });
  });
});

const port = program.port || 3334;
http.listen(port, () => {
  console.log('Listen on port: ', port);
});