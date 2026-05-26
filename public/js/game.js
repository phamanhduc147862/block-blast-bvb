// Hơn 30 hình khối đa dạng chuẩn Block Blast
const BLOCK_SHAPES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [0, 1],
  ],
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [0, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  [
    [0, 1],
    [1, 1],
    [1, 0],
  ],
];

class BlockBlastGame {
  constructor(size = 8) {
    this.size = size;
    this.board = Array(this.size)
      .fill()
      .map(() => Array(this.size).fill(0));
    this.score = 0;
  }

  canPlaceBlock(shape, startRow, startCol) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          let boardRow = startRow + r;
          let boardCol = startCol + c;
          if (
            boardRow >= this.size ||
            boardCol >= this.size ||
            boardRow < 0 ||
            boardCol < 0 ||
            this.board[boardRow][boardCol] === 1
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placeBlock(shape, startRow, startCol) {
    if (!this.canPlaceBlock(shape, startRow, startCol)) return false;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          this.board[startRow + r][startCol + c] = 1;
        }
      }
    }

    let blocksCount = shape.flat().filter((val) => val === 1).length;
    this.score += blocksCount * 10;
    this.checkAndClearLines();
    return true;
  }

  checkAndClearLines() {
    let rowsToClear = [];
    let colsToClear = [];

    for (let r = 0; r < this.size; r++) {
      if (this.board[r].every((cell) => cell === 1)) rowsToClear.push(r);
    }
    for (let c = 0; c < this.size; c++) {
      let isColFull = true;
      for (let r = 0; r < this.size; r++) {
        if (this.board[r][c] === 0) {
          isColFull = false;
          break;
        }
      }
      if (isColFull) colsToClear.push(c);
    }

    rowsToClear.forEach((r) => this.board[r].fill(0));
    colsToClear.forEach((c) => {
      for (let r = 0; r < this.size; r++) this.board[r][c] = 0;
    });

    const totalLines = rowsToClear.length + colsToClear.length;
    if (totalLines > 0) {
      this.score += totalLines * 100 * totalLines;
    }
  }

  // Thuật toán: Trả về danh sách những khối CHẮC CHẮN nhét vừa bàn cờ
  getValidShapes(allShapes) {
    const validShapes = [];
    for (let shape of allShapes) {
      let canFit = false;
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.canPlaceBlock(shape, r, c)) {
            canFit = true;
            break;
          }
        }
        if (canFit) break;
      }
      if (canFit) validShapes.push(shape);
    }
    return validShapes.length > 0 ? validShapes : [[[1]]];
  }

  checkAvailableMoves(availableShapes) {
    for (let shape of availableShapes) {
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.canPlaceBlock(shape, r, c)) return true;
        }
      }
    }
    return false;
  }

  reset() {
    this.board = Array(this.size)
      .fill()
      .map(() => Array(this.size).fill(0));
    this.score = 0;
  }
}

const myGame = new BlockBlastGame();
