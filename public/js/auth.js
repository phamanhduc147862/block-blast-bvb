document.addEventListener("DOMContentLoaded", () => {
  const loginScreen = document.getElementById("login-screen");
  const menuScreen = document.getElementById("menu-screen");
  const playerNameInput = document.getElementById("player-name-input");
  const startGameBtn = document.getElementById("start-game-btn");
  const leaderboardBtn = document.getElementById("leaderboard-btn");
  const leaderboardScreen = document.getElementById("leaderboard-screen");
  const closeLeaderboardBtn = document.getElementById("close-leaderboard-btn");
  const displayPlayerName = document.getElementById("display-player-name");

  const PLAYER_NAME_KEY = "blockBlastPlayerName";
  let currentLeaderboard = [];

  function getStoredPlayerName() {
    return localStorage.getItem(PLAYER_NAME_KEY) || "";
  }

  function setPlayerName(name) {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  }

  function addScoreToLeaderboard(playerName, score) {
    if (window.socket) {
      console.log("📤 Gửi điểm lên leaderboard:", playerName, score);
      window.socket.emit("add_score", { playerName, score });
    } else {
      console.warn("⚠️ Socket không kết nối - không thể gửi điểm");
    }
  }

  function requestLeaderboard() {
    if (window.socket) {
      console.log("📥 Yêu cầu leaderboard từ server");
      window.socket.emit("get_leaderboard");
    } else {
      console.warn("⚠️ Socket không kết nối - không thể lấy leaderboard");
    }
  }

  function renderLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = "";

    if (currentLeaderboard.length === 0) {
      leaderboardList.innerHTML =
        "<li style='text-align: center; color: #555b6e;'>Chưa có điểm số nào</li>";
      return;
    }

    currentLeaderboard.forEach((entry, index) => {
      const li = document.createElement("li");
      let medal = "";
      if (index === 0) medal = "🥇";
      else if (index === 1) medal = "🥈";
      else if (index === 2) medal = "🥉";
      else medal = `${index + 1}.`;

      li.innerHTML = `<span>${medal} ${entry.name}</span><span>${entry.score}</span>`;
      leaderboardList.appendChild(li);
    });
  }

  function showMenuScreen() {
    loginScreen.style.display = "none";
    menuScreen.style.display = "flex";
    displayPlayerName.innerText = getStoredPlayerName();
  }

  function showLeaderboard() {
    requestLeaderboard();
    setTimeout(() => {
      renderLeaderboard();
      leaderboardScreen.style.display = "flex";
    }, 200);
  }

  function closeLeaderboard() {
    leaderboardScreen.style.display = "none";
  }

  startGameBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (name.length === 0) {
      alert("Vui lòng nhập tên của bạn!");
      return;
    }
    setPlayerName(name);
    showMenuScreen();
  });

  playerNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      startGameBtn.click();
    }
  });

  leaderboardBtn.addEventListener("click", () => {
    showLeaderboard();
  });

  closeLeaderboardBtn.addEventListener("click", () => {
    closeLeaderboard();
  });

  leaderboardScreen.addEventListener("click", (e) => {
    if (e.target === leaderboardScreen) {
      closeLeaderboard();
    }
  });

  if (window.socket) {
    console.log("✅ Socket.io connected - leaderboard ready");

    window.socket.on("leaderboard_data", (data) => {
      console.log("📊 Nhận leaderboard data:", data);
      currentLeaderboard = data;
      renderLeaderboard();
    });

    window.socket.on("leaderboard_updated", (data) => {
      console.log("🔄 Leaderboard updated:", data);
      currentLeaderboard = data;
      if (leaderboardScreen.style.display === "flex") {
        renderLeaderboard();
      }
    });
  } else {
    console.error("❌ Socket.io NOT connected - leaderboard disabled");
    leaderboardBtn.disabled = true;
    leaderboardBtn.title = "Leaderboard chỉ hoạt động khi có kết nối server";
  }

  const savedName = getStoredPlayerName();
  if (savedName) {
    playerNameInput.value = savedName;
    showMenuScreen();
  }

  window.addScoreToLeaderboard = addScoreToLeaderboard;
  window.getStoredPlayerName = getStoredPlayerName;
});
