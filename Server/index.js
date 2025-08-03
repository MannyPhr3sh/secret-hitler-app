const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
let lobbies = {};

function assignRoles(players) {
  const total = players.length;
  let numFascists = total <= 6 ? 1 : total <= 8 ? 2 : 3;
  let roles = Array(total - numFascists - 1).fill('Liberal')
    .concat(Array(numFascists).fill('Fascist'))
    .concat(['Hitler']);

  roles = roles.sort(() => Math.random() - 0.5);

  const assignments = {};
  players.forEach((player, idx) => {
    assignments[player.id] = {
      name: player.name,
      role: roles[idx]
    };
  });

  const fascists = Object.entries(assignments)
    .filter(([_, data]) => data.role === 'Fascist');

  const hitler = Object.entries(assignments)
    .find(([_, data]) => data.role === 'Hitler');

  fascists.forEach(([id, data]) => {
    assignments[id].others = fascists
      .filter(([fid]) => fid !== id)
      .map(([_, f]) => f.name);
    assignments[id].hitler = hitler[1].name;
  });

  return assignments;
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('join-lobby', ({ room, name }) => {
    if (!lobbies[room]) lobbies[room] = [];
    lobbies[room].push({ id: socket.id, name });
    socket.join(room);
    io.to(room).emit('lobby-update', lobbies[room]);
  });

  socket.on('start-game', (room) => {
    const players = lobbies[room];
    const roles = assignRoles(players);
    players.forEach(p => {
      io.to(p.id).emit('role-assignment', roles[p.id]);
    });
  });

  socket.on('disconnect', () => {
    for (let room in lobbies) {
      lobbies[room] = lobbies[room].filter(p => p.id !== socket.id);
      io.to(room).emit('lobby-update', lobbies[room]);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
