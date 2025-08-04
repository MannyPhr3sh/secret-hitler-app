// 🔁 Replace this with your own Firebase config:
const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "YOUR-PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR-PROJECT.firebaseio.com",
  projectId: "YOUR-PROJECT",
  storageBucket: "YOUR-PROJECT.appspot.com",
  messagingSenderId: "YOUR-SENDER-ID",
  appId: "YOUR-APP-ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentPlayerName = '';
let currentRoomCode = '';
let isHost = false;

function showCreate() {
  document.getElementById("create-section").classList.remove("hidden");
  document.getElementById("join-section").classList.add("hidden");
}

function showJoin() {
  document.getElementById("join-section").classList.remove("hidden");
  document.getElementById("create-section").classList.add("hidden");
}

function createGame() {
  const name = document.getElementById("host-name").value.trim();
  if (!name) return alert("Enter your name");

  currentPlayerName = name;
  isHost = true;

  const roomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
  currentRoomCode = roomCode;

  db.ref(`games/${roomCode}`).set({
    host: name,
    players: {
      [name]: { role: "", revealed: false }
    }
  });

  showLobby();
}

function joinGame() {
  const name = document.getElementById("player-name").value.trim();
  const code = document.getElementById("join-code").value.trim().toUpperCase();
  if (!name || !code) return alert("Enter name and code");

  currentPlayerName = name;
  currentRoomCode = code;

  const playerRef = db.ref(`games/${code}/players/${name}`);
  playerRef.set({ role: "", revealed: false });
  showLobby();
}

function showLobby() {
  document.getElementById("create-join").classList.add("hidden");
  document.getElementById("create-section").classList.add("hidden");
  document.getElementById("join-section").classList.add("hidden");
  document.getElementById("lobby-section").classList.remove("hidden");
  document.getElementById("lobby-code").textContent = currentRoomCode;

  db.ref(`games/${currentRoomCode}/players`).on('value', snapshot => {
    const players = snapshot.val() || {};
    document.getElementById("player-list").textContent = Object.keys(players).join(', ');
  });

  document.getElementById("start-button").style.display = isHost ? 'block' : 'none';
}

function startGame() {
  db.ref(`games/${currentRoomCode}/players`).once('value', snapshot => {
    const players = Object.keys(snapshot.val());
    const roles = assignRoles(players.length);

    const roleAssignments = {};
    players.forEach((name, i) => {
      roleAssignments[name] = { role: roles[i], revealed: false };
    });

    db.ref(`games/${currentRoomCode}/players`).set(roleAssignments);
  });
}

function assignRoles(count) {
  let fascistCount = count <= 6 ? 1 : count <= 8 ? 2 : 3;
  const roles = Array(count).fill("Liberal");
  roles[0] = "Hitler";
  for (let i = 1; i <= fascistCount; i++) {
    roles[i] = "Fascist";
  }
  return shuffle(roles);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Listen for your own role
db.ref().on
