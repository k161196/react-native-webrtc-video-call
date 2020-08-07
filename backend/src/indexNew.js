const express = require('express');
const app = express();

const port = 4000;

const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server, {origins: '*:*'});
app.use(express.static(__dirname + '/public'));

io.sockets.on('error', e => console.log(e));
server.listen(port, () => console.log(`Server is running on port ${port}`));

const users = {};
io.on('connection', socket => {
  console.log('socket id from server:', socket.id);
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }
  socket.emit('yourId', socket.id);
  io.sockets.emit('allUsers', users);
  socket.on('disconnect', () => {
    delete users[socket.id];
  });
  socket.on('callUser', data => {
    io.to(data.userToCall).emit('hey', {
      signal: data.signalData,
      from: data.from,
    });
  });
  socket.on('acceptCall', data => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
});
