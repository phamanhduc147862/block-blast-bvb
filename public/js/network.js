// Config Socket.io server
let SOCKET_SERVER = null;

if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  // Local development
  SOCKET_SERVER = "http://localhost:3000";
} else if (window.location.hostname.includes("vercel.app")) {
  // Production on Vercel - connect to same domain
  SOCKET_SERVER = `https://block-blast-bvb.onrender.com`;
}
// Else: GitHub Pages or other hosts - SOCKET_SERVER remains null (multiplayer disabled)

console.log("🌐 Socket Server Config:", SOCKET_SERVER || "DISABLED");

window.socket = SOCKET_SERVER
  ? io(SOCKET_SERVER, { reconnection: true })
  : null;
window.isMultiplayer = false;

if (window.socket) {
  window.socket.on("connect", () => {
    console.log("✅ Socket.io connected:", window.socket.id);
  });

  window.socket.on("disconnect", () => {
    console.log("❌ Socket.io disconnected");
  });

  window.socket.on("connect_error", (error) => {
    console.error("⚠️ Socket.io error:", error);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("single-btn").addEventListener("click", () => {
    window.isMultiplayer = false;
    document.getElementById("menu-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "flex";
    document.getElementById("single-best").style.display = "inline";
    document.getElementById("opp-label").style.display = "none";

    const bestScore = localStorage.getItem("blockBlastBestScore") || 0;
    document.getElementById("high-score").innerText = bestScore;

    if (typeof resetGameUI === "function") resetGameUI();
  });

  const createRoomBtn = document.getElementById("create-room-btn");
  const joinRoomBtn = document.getElementById("join-room-btn");

  if (window.socket) {
    createRoomBtn.addEventListener("click", () => {
      window.socket.emit("create_room");
    });

    joinRoomBtn.addEventListener("click", () => {
      const roomId = document.getElementById("room-input").value.trim();
      if (roomId.length === 4) {
        window.socket.emit("join_room", roomId);
      } else {
        alert("Vui lòng nhập đúng mã phòng có 4 chữ số!");
      }
    });
  } else {
    createRoomBtn.disabled = true;
    joinRoomBtn.disabled = true;
    createRoomBtn.title = "Chế độ multiplayer không khả dụng trên GitHub Pages";
    joinRoomBtn.title = "Chế độ multiplayer không khả dụng trên GitHub Pages";
  }

  document.getElementById("back-to-menu-btn").addEventListener("click", () => {
    location.reload();
  });
});

if (window.socket) {
  window.socket.on("room_created", (roomId) => {
    document.getElementById("create-room-btn").style.display = "none";
    document.getElementById("room-info-box").style.display = "block";
    document.getElementById("generated-room-id").innerText = roomId;
  });

  window.socket.on("room_error", (msg) => {
    alert(msg);
  });

  window.socket.on("match_start", (roomId) => {
    window.isMultiplayer = true;
    document.getElementById("menu-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "flex";
    document.getElementById("single-best").style.display = "none";
    document.getElementById("opp-label").style.display = "inline";

    document.getElementById("opp-label").innerHTML =
      'Đối thủ: <strong id="opp-score">0</strong>';

    if (typeof resetGameUI === "function") resetGameUI();
  });

  window.socket.on("opponent_state_updated", (data) => {
    document.getElementById("opp-score").innerText = data.score;
    if (window.isSpectating && typeof renderSpectatorBoard === "function") {
      renderSpectatorBoard(data.board);
    }
  });

  window.socket.on("opponent_stuck_notice", () => {
    const currentScore = document.getElementById("opp-score").innerText;
    document.getElementById("opp-label").innerHTML =
      `Đối thủ: <strong id="opp-score">${currentScore}</strong> <span style='color:#ffb703; font-size: 0.85rem; margin-left: 5px; animation: blinker 1s linear infinite;'>[KẸT 💀]</span>`;
  });

  window.socket.on("match_result", (data) => {
    const gameOverScreen = document.getElementById("game-over-screen");
    const gameOverText = document.getElementById("game-over-text");
    gameOverScreen.style.display = "flex";
    document.getElementById("rematch-btn").style.display = "inline-block";

    if (data.result === "win") {
      gameOverText.innerHTML = "HẾT TRẬN<br>Bạn Thắng 🎉";
    } else if (data.result === "lose") {
      gameOverText.innerHTML = "HẾT TRẬN<br>Bạn Thua 😭";
    } else {
      gameOverText.innerHTML = "HẾT TRẬN<br>Hòa Nhau 🤝";
    }

    if (window.addScoreToLeaderboard && window.getStoredPlayerName) {
      const playerName = window.getStoredPlayerName();
      const score = myGame.score;
      window.addScoreToLeaderboard(playerName, score);
    }
  });

  window.socket.on("opponent_wants_rematch", () => {
    const gameOverText = document.getElementById("game-over-text");
    if (!gameOverText.innerHTML.includes("🔥 Đối thủ muốn phục thù!")) {
      gameOverText.innerHTML +=
        "<br><span style='font-size: 1rem; color: #ffb703;'>🔥 Đối thủ muốn phục thù!</span>";
    }
  });

  window.socket.on("reset_game", () => {
    if (typeof resetGameUI === "function") resetGameUI();
  });

  window.socket.on("opponent_left", () => {
    alert("Đối thủ đã thoát phòng đấu!");
    location.reload();
  });
}
