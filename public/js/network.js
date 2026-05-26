window.socket = io();
window.isMultiplayer = false;

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

  document.getElementById("create-room-btn").addEventListener("click", () => {
    socket.emit("create_room");
  });

  document.getElementById("join-room-btn").addEventListener("click", () => {
    const roomId = document.getElementById("room-input").value.trim();
    if (roomId.length === 4) {
      socket.emit("join_room", roomId);
    } else {
      alert("Vui lòng nhập đúng mã phòng có 4 chữ số!");
    }
  });

  document.getElementById("back-to-menu-btn").addEventListener("click", () => {
    location.reload();
  });
});

socket.on("room_created", (roomId) => {
  document.getElementById("create-room-btn").style.display = "none";
  document.getElementById("room-info-box").style.display = "block";
  document.getElementById("generated-room-id").innerText = roomId;
});

socket.on("room_error", (msg) => {
  alert(msg);
});

socket.on("match_start", (roomId) => {
  window.isMultiplayer = true;
  document.getElementById("menu-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";
  document.getElementById("single-best").style.display = "none";
  document.getElementById("opp-label").style.display = "inline";

  // --- SỬA Ở ĐÂY: Khôi phục lại toàn bộ cấu trúc HTML ---
  document.getElementById("opp-label").innerHTML =
    'Đối thủ: <strong id="opp-score">0</strong>';

  if (typeof resetGameUI === "function") resetGameUI();
});

socket.on("opponent_state_updated", (data) => {
  document.getElementById("opp-score").innerText = data.score;
  if (window.isSpectating && typeof renderSpectatorBoard === "function") {
    renderSpectatorBoard(data.board);
  }
});

socket.on("opponent_stuck_notice", () => {
  // Lấy giữ lại điểm số hiện tại của đối thủ
  const currentScore = document.getElementById("opp-score").innerText;

  // Nối lại thẻ HTML: Vừa giữ ID 'opp-score' để nhận điểm lỡ nhịp, vừa hiện chữ ĐÃ KẸT nhấp nháy
  document.getElementById("opp-label").innerHTML =
    `Đối thủ: <strong id="opp-score">${currentScore}</strong> <span style='color:#ffb703; font-size: 0.85rem; margin-left: 5px; animation: blinker 1s linear infinite;'>[KẸT 💀]</span>`;
});

socket.on("match_result", (data) => {
  const gameOverScreen = document.getElementById("game-over-screen");
  const gameOverText = document.getElementById("game-over-text");
  gameOverScreen.style.display = "flex";
  document.getElementById("rematch-btn").style.display = "inline-block";

  if (data.result === "win")
    gameOverText.innerHTML = "HẾT TRẬN<br>Bạn Thắng 🎉";
  else if (data.result === "lose")
    gameOverText.innerHTML = "HẾT TRẬN<br>Bạn Thua 😭";
  else gameOverText.innerHTML = "HẾT TRẬN<br>Hòa Nhau 🤝";
});

socket.on("opponent_wants_rematch", () => {
  const gameOverText = document.getElementById("game-over-text");
  if (!gameOverText.innerHTML.includes("🔥 Đối thủ muốn phục thù!")) {
    gameOverText.innerHTML +=
      "<br><span style='font-size: 1rem; color: #ffb703;'>🔥 Đối thủ muốn phục thù!</span>";
  }
});

socket.on("reset_game", () => {
  if (typeof resetGameUI === "function") resetGameUI();
});

socket.on("opponent_left", () => {
  alert("Đối thủ đã thoát phòng đấu!");
  location.reload();
});
