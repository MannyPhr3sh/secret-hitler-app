import React, { useState } from "react";

const ROLES = ["Liberal", "Liberal", "Fascist", "Fascist", "Hitler"]; // For 5 players

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function App() {
  const [players, setPlayers] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState(null);
  const [viewIndex, setViewIndex] = useState(null);

  function handleAddPlayer(name) {
    setPlayers([...players, { name }]);
  }

  function assignRoles() {
    const roles = shuffle(ROLES.slice(0, players.length));
    setAssignedRoles(
      players.map((player, i) => ({
        ...player,
        role: roles[i],
      }))
    );
    setViewIndex(0);
  }

  function getInfo(player) {
    if (!assignedRoles) return "";
    if (player.role === "Liberal") {
      return "You are a Liberal.";
    }
    if (player.role === "Fascist") {
      const fascists = assignedRoles.filter((p) => p.role === "Fascist" && p.name !== player.name).map((p) => p.name);
      const hitler = assignedRoles.find((p) => p.role === "Hitler");
      return `You are a Fascist. The other Fascists are: ${fascists.join(", ") || "none"}. Hitler is: ${hitler.name}.`;
    }
    if (player.role === "Hitler") {
      return "You are Hitler.";
    }
    return "";
  }

  // Add player form
  const [newName, setNewName] = useState("");

  if (!assignedRoles) {
    return (
      <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        <h2>Secret Hitler Setup</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName && players.length < ROLES.length) {
              handleAddPlayer(newName);
              setNewName("");
            }
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            value={newName}
            placeholder="Player name"
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit">Add</button>
        </form>
        <ul>
          {players.map((player, idx) => (
            <li key={idx}>{player.name}</li>
          ))}
        </ul>
        <button
          onClick={assignRoles}
          disabled={players.length < 5}
          style={{ marginTop: 20, width: "100%", padding: 10 }}
        >
          Assign Roles
        </button>
        <p style={{ marginTop: 10 }}>Add 5 players, then assign roles.</p>
      </div>
    );
  }

  if (viewIndex !== null && assignedRoles[viewIndex]) {
    const player = assignedRoles[viewIndex];
    return (
      <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        <h2>Role Reveal for {player.name}</h2>
        <div
          style={{
            background: "#eee",
            padding: 20,
            borderRadius: 10,
            fontSize: 20,
            marginBottom: 20,
            minHeight: 100,
          }}
        >
          {getInfo(player)}
        </div>
        <button
          onClick={() => setViewIndex(viewIndex + 1)}
          style={{ width: "100%", padding: 10 }}
        >
          Next Player
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>All roles assigned!</h2>
      <p>Hand the phone to the first player and press "Next Player" to reveal their role.</p>
      <button
        onClick={() => setViewIndex(0)}
        style={{ width: "100%", padding: 10 }}
      >
        Start Role Reveal
      </button>
    </div>
  );
}

export default App;