import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://your-server-url.onrender.com'); // 🔁 Replace with your Render backend URL

function App() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [roleInfo, setRoleInfo] = useState(null);

  useEffect(() => {
    socket.on('lobby-update', (players) => setPlayers(players));
    socket.on('role-assignment', (info) => setRoleInfo(info));
  }, []);

  const joinLobby = () => {
    socket.emit('join-lobby', { room, name });
    setJoined(true);
  };

  const startGame = () => {
    socket.emit('start-game', room);
  };

  if (roleInfo) {
    return (
      <div style={styles.container}>
        <h2>You are: {roleInfo.role}</h2>
        {roleInfo.role === 'Fascist' && (
          <>
            <p><strong>Other Fascists:</strong> {roleInfo.others.join(', ') || 'None'}</p>
            <p><strong>Hitler is:</strong> {roleInfo.hitler}</p>
          </>
        )}
        {roleInfo.role === 'Hitler' && <p>You do not know anyone.</p>}
        {roleInfo.role === 'Liberal' && <p>Find and stop the fascists!</p>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {!joined ? (
        <>
          <h1>Secret Roles</h1>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Room code"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={styles.input}
          />
          <button onClick={joinLobby} style={styles.button}>Join Game</button>
        </>
      ) : (
        <>
          <h2>Room: {room}</h2>
          <p>Players:</p>
          <ul>
            {players.map(p => <li key={p.id}>{p.name}</li>)}
          </ul>
          <button onClick={startGame} style={styles.button}>Start Game</button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 20, fontFamily: 'Arial, sans-serif' },
  input: { display: 'block', margin: '10px 0', padding: 10, fontSize: 16 },
  button: { padding: 10, fontSize: 16, marginTop: 10 }
};

export default App;
