const express = require('express');
const app = express();

const port = 4000;

const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server, {origins: '*:*'});
app.use(express.static(__dirname + '/public'));

io.sockets.on('error', e => console.log(e));
server.listen(port, () => console.log(`Server is running on port ${port}`));

let broadcaster;

const rooms = {};
io.sockets.on('connection', socket => {
  console.log('socket :' + socket.id);
  socket.on('broadcaster', () => {
    console.log('broadcast');
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster');
  });
  socket.on('join room', roomID => {
    console.log('join room', roomID);
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }
    const otherUser = rooms[roomID].find(id => {
      console.log('id', id);
      return id !== socket.id;
    });
    console.log('room', rooms);
    console.log('other user', otherUser);
    if (otherUser) {
      console.log('other user', otherUser);
      socket.emit('other user', otherUser);
      socket.to(otherUser).emit('user joined', socket.id);
    }
  });
  socket.on('offer', payload => {
    console.log('offer payload to target', payload.target);
    io.to(payload.target).emit('offer', payload);
  });
  socket.on('answer', payload => {
    console.log('answer payload emoit to target:', payload.target);
    io.to(payload.target).emit('answer', payload);
  });
  socket.on('ice-candidate', incoming => {
    console.log('ice-candidate');
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });
  // socket.on('watcher', () => {
  //   socket.to(broadcaster).emit('watcher', socket.id);
  // });
  socket.on('disconnect', () => {
    console.log('disconnect');
    socket.to(broadcaster).emit('disconnectPeer', socket.id);
  });
  // socket.on('offer', (id, message) => {
  //   socket.to(id).emit('offer', socket.id, message);
  // });
  // socket.on('answer', (id, message) => {
  //   socket.to(id).emit('answer', socket.id, message);
  // });
  // socket.on('candidate', (id, message) => {
  //   socket.to(id).emit('candidate', socket.id, message);
  // });
  // socket.on('comment', (id, message) => {
  //   socket.to(id).emit('comment', socket.id, message);
  // });
});
