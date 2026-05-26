document.addEventListener("DOMContentLoaded", () => {
  window.isSpectating = false;
  let activeBlock = null;
  let cloneBlock = null;

  document.getElementById("spawn-area").addEventListener(
    "touchstart",
    (e) => {
      if (window.isSpectating) return;

      const block = e.target.closest(".block-container");
      if (!block || block.classList.contains("used")) return;

      activeBlock = block;
      activeBlock.classList.add("block-ghost");

      cloneBlock = activeBlock.cloneNode(true);
      cloneBlock.classList.remove("block-ghost");
      cloneBlock.classList.add("dragging");
      document.body.appendChild(cloneBlock);

      moveClone(e.touches[0].pageX, e.touches[0].pageY);
    },
    { passive: false },
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!cloneBlock) return;
      e.preventDefault();
      moveClone(e.touches[0].pageX, e.touches[0].pageY);
      updatePlacementPreview();
    },
    { passive: false },
  );

  document.addEventListener("touchend", (e) => {
    if (!cloneBlock) return;

    clearAllPreviews();
    const rect = cloneBlock.getBoundingClientRect();
    const targetX = rect.left + 15;
    const targetY = rect.top + 15;
    const dropTarget = document.elementFromPoint(targetX, targetY);

    cloneBlock.remove();
    cloneBlock = null;

    if (dropTarget && dropTarget.classList.contains("cell")) {
      const row = parseInt(dropTarget.dataset.row);
      const col = parseInt(dropTarget.dataset.col);
      const shape = JSON.parse(activeBlock.dataset.shape);

      const isPlaced = myGame.placeBlock(shape, row, col);

      if (isPlaced) {
        renderBoard();

        // 1. Tàng hình block vừa đặt để giữ khoảng cách cho các block kia
        activeBlock.style.visibility = "hidden";
        activeBlock.classList.add("used");
        activeBlock.classList.remove("block-ghost");

        // 2. Lấy danh sách block còn lại
        let currentBlocks = Array.from(
          document.querySelectorAll("#spawn-area .block-container:not(.used)"),
        );

        // 3. Nếu hết sạch block chưa dùng, LẬP TỨC sinh 3 khối mới
        if (currentBlocks.length === 0) {
          if (typeof spawnBlocks === "function") spawnBlocks();
          // Lấy lại danh sách mới toanh vừa sinh ra
          currentBlocks = Array.from(
            document.querySelectorAll(
              "#spawn-area .block-container:not(.used)",
            ),
          );
        }

        // 4. Kiểm tra Game Over dựa trên danh sách chuẩn cuối cùng
        const shapeArrays = currentBlocks.map((el) =>
          JSON.parse(el.dataset.shape),
        );

        if (!myGame.checkAvailableMoves(shapeArrays)) {
          if (window.isMultiplayer) {
            window.isSpectating = true;
            document.getElementById("spawn-area").innerHTML =
              '<h3 style="color:#ffb703; width:100%; text-align:center;">Bạn đã kẹt!<br>Đang xem đối thủ...</h3>';
            if (window.socket) window.socket.emit("player_stuck", myGame.score);
          } else {
            const currentScore = myGame.score;
            let bestScore =
              parseInt(localStorage.getItem("blockBlastBestScore")) || 0;
            if (currentScore > bestScore) {
              bestScore = currentScore;
              localStorage.setItem("blockBlastBestScore", bestScore);
            }

            const gameOverScreen = document.getElementById("game-over-screen");
            const gameOverText = document.getElementById("game-over-text");
            document.getElementById("rematch-btn").style.display =
              "inline-block";
            gameOverText.innerHTML = `GAME OVER<br><span style="font-size: 1.2rem;">Điểm: ${currentScore} | Kỷ lục: ${bestScore}</span>`;
            gameOverScreen.style.display = "flex";
          }
        }
      } else {
        activeBlock.classList.remove("block-ghost");
      }
    } else {
      activeBlock.classList.remove("block-ghost");
    }

    activeBlock = null;
  });

  function moveClone(x, y) {
    cloneBlock.style.left = `${x - cloneBlock.offsetWidth / 2}px`;
    cloneBlock.style.top = `${y - cloneBlock.offsetHeight - 40}px`;
  }

  function clearAllPreviews() {
    document.querySelectorAll("#grid-board .cell").forEach((c) => {
      c.classList.remove("preview");
      c.classList.remove("preview-clear");
    });
  }

  function updatePlacementPreview() {
    clearAllPreviews();

    if (!cloneBlock || !activeBlock) return;

    const rect = cloneBlock.getBoundingClientRect();
    const targetX = rect.left + 15;
    const targetY = rect.top + 15;
    const dropTarget = document.elementFromPoint(targetX, targetY);

    if (dropTarget && dropTarget.classList.contains("cell")) {
      const row = parseInt(dropTarget.dataset.row);
      const col = parseInt(dropTarget.dataset.col);
      const shape = JSON.parse(activeBlock.dataset.shape);

      if (myGame.canPlaceBlock(shape, row, col)) {
        const cells = document.querySelectorAll("#grid-board .cell");

        // VẼ BÓNG MỜ KHỐI GẠCH
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
              let index = (row + r) * 8 + (col + c);
              if (cells[index]) cells[index].classList.add("preview");
            }
          }
        }

        // MÔ PHỎNG NỔ HÀNG & TÔ MÀU HỒNG NEON
        let rowsToClear = [];
        let colsToClear = [];

        for (let r = 0; r < 8; r++) {
          let isRowFull = true;
          for (let c = 0; c < 8; c++) {
            let isFilledOnBoard = myGame.board[r][c] !== 0;
            let isFilledByPreview = false;
            if (
              r >= row &&
              r < row + shape.length &&
              c >= col &&
              c < col + shape[0].length
            ) {
              if (shape[r - row][c - col] === 1) isFilledByPreview = true;
            }
            if (!isFilledOnBoard && !isFilledByPreview) {
              isRowFull = false;
              break;
            }
          }
          if (isRowFull) rowsToClear.push(r);
        }

        for (let c = 0; c < 8; c++) {
          let isColFull = true;
          for (let r = 0; r < 8; r++) {
            let isFilledOnBoard = myGame.board[r][c] !== 0;
            let isFilledByPreview = false;
            if (
              r >= row &&
              r < row + shape.length &&
              c >= col &&
              c < col + shape[0].length
            ) {
              if (shape[r - row][c - col] === 1) isFilledByPreview = true;
            }
            if (!isFilledOnBoard && !isFilledByPreview) {
              isColFull = false;
              break;
            }
          }
          if (isColFull) colsToClear.push(c);
        }

        rowsToClear.forEach((r) => {
          for (let c = 0; c < 8; c++)
            cells[r * 8 + c].classList.add("preview-clear");
        });

        colsToClear.forEach((c) => {
          for (let r = 0; r < 8; r++)
            cells[r * 8 + c].classList.add("preview-clear");
        });
      }
    }
  }
});
