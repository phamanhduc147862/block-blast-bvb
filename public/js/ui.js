function renderBoard() {
  const cells = document.querySelectorAll("#grid-board .cell");
  if (!cells.length) return;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const index = r * 8 + c;
      if (myGame.board[r][c] === 1) {
        cells[index].style.backgroundColor = "#00adb5";
        cells[index].style.boxShadow = "inset 0 0 5px rgba(0,0,0,0.3)";
      } else {
        cells[index].style.backgroundColor = "#2a2a40";
        cells[index].style.boxShadow = "none";
      }
    }
  }

  document.getElementById("my-score").innerText = myGame.score;

  if (!window.isMultiplayer) {
    let bestScore = parseInt(
      localStorage.getItem("blockBlastBestScore") || "0",
      10,
    );
    if (myGame.score > bestScore) {
      localStorage.setItem("blockBlastBestScore", myGame.score);
      document.getElementById("high-score").innerText = myGame.score;
    }
  }

  if (window.isMultiplayer && window.socket) {
    window.socket.emit("update_state", {
      score: myGame.score,
      board: myGame.board,
    });
  }
}

function renderSpectatorBoard(board) {
  const cells = document.querySelectorAll("#grid-board .cell");
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const index = r * 8 + c;
      if (board[r][c] === 1) {
        cells[index].style.backgroundColor = "#e84545";
        cells[index].style.boxShadow = "inset 0 0 5px rgba(0,0,0,0.3)";
      } else {
        cells[index].style.backgroundColor = "#2a2a40";
        cells[index].style.boxShadow = "none";
      }
    }
  }
}

function spawnBlocks() {
  const spawnArea = document.getElementById("spawn-area");
  if (!spawnArea) return;

  // Dọn sạch khu vực chờ
  spawnArea.innerHTML = "";

  // Lọc ra các khối an toàn trước khi bốc
  const safeShapes = myGame.getValidShapes(BLOCK_SHAPES);

  for (let i = 0; i < 3; i++) {
    // Chỉ bốc từ kho an toàn
    const shape = safeShapes[Math.floor(Math.random() * safeShapes.length)];
    const blockDiv = document.createElement("div");
    blockDiv.classList.add("block-container");

    const rows = shape.length;
    const cols = shape[0].length;

    blockDiv.style.gridTemplateRows = `repeat(${rows}, 25px)`;
    blockDiv.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
    blockDiv.dataset.shape = JSON.stringify(shape);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.classList.add("block-cell");
        if (shape[r][c] === 0) {
          cell.classList.add("empty");
        }
        blockDiv.appendChild(cell);
      }
    }
    spawnArea.appendChild(blockDiv);
  }
}

function resetGameUI() {
  window.isSpectating = false;
  myGame.reset();
  renderBoard();
  spawnBlocks();

  // --- SỬA Ở ĐÂY: Đảm bảo reset cả chữ lẫn thẻ chứa điểm ---
  document.getElementById("opp-label").innerHTML =
    'Đối thủ: <strong id="opp-score">0</strong>';

  document.getElementById("game-over-screen").style.display = "none";

  const rematchBtn = document.getElementById("rematch-btn");
  rematchBtn.innerText = "Chơi Lại Ván Mới";
  rematchBtn.disabled = false;
  rematchBtn.style.backgroundColor = "#00adb5";
}

document.addEventListener("DOMContentLoaded", () => {
  const gridBoard = document.getElementById("grid-board");
  const gridSize = 8;
  const totalCells = gridSize * gridSize;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = Math.floor(i / gridSize);
    cell.dataset.col = i % gridSize;
    gridBoard.appendChild(cell);
  }

  spawnBlocks();

  document.getElementById("rematch-btn").addEventListener("click", () => {
    if (window.isMultiplayer) {
      const rematchBtn = document.getElementById("rematch-btn");
      rematchBtn.innerText = "Đang chờ đối thủ đồng ý...";
      rematchBtn.disabled = true;
      rematchBtn.style.backgroundColor = "#555b6e";
      if (window.socket) window.socket.emit("play_again");
    } else {
      resetGameUI();
      document.getElementById("high-score").innerText =
        localStorage.getItem("blockBlastBestScore") || 0;
    }
  });
});
