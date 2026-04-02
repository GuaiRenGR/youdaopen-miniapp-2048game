/**
 * 2048游戏核心逻辑
 */
class Game2048 {
  constructor(size = 4) {
    this.size = size;
    this.grid = [];
    this.score = 0;
    this.lastScore = 0;
    this.over = false;
    this.won = false;
  }

  // 初始化游戏
  start() {
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.lastScore = 0;
    this.over = false;
    this.won = false;
    
    // 初始生成两个数字
    this.addRandomTile();
    this.addRandomTile();
  }

  // 创建空网格
  createEmptyGrid() {
    const grid = [];
    for (let i = 0; i < this.size; i++) {
      grid[i] = [];
      for (let j = 0; j < this.size; j++) {
        grid[i][j] = 0;
      }
    }
    return grid;
  }

  // 在随机空位置添加一个新数字(2或4)
  addRandomTile() {
    const emptyCells = [];
    
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    
    if (emptyCells.length === 0) return false;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    
    return true;
  }

  // 移动操作
  move(direction) {
    if (this.over) return false;
    
    this.lastScore = 0;
    let moved = false;
    
    // 保存当前状态用于比较
    const oldGrid = JSON.stringify(this.grid);
    
    switch (direction) {
      case 'left':
        moved = this.moveLeft();
        break;
      case 'right':
        moved = this.moveRight();
        break;
      case 'up':
        moved = this.moveUp();
        break;
      case 'down':
        moved = this.moveDown();
        break;
    }
    
    // 如果网格发生变化，添加新数字
    if (moved && JSON.stringify(this.grid) !== oldGrid) {
      this.addRandomTile();
    }
    
    return moved;
  }

  // 向左移动
  moveLeft() {
    let moved = false;
    
    for (let i = 0; i < this.size; i++) {
      const row = this.grid[i].filter(val => val !== 0);
      
      // 合并相同数字
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          this.lastScore += row[j];
          this.score += row[j];
          row.splice(j + 1, 1);
          moved = true;
        }
      }
      
      // 填充0
      while (row.length < this.size) {
        row.push(0);
      }
      
      // 检查是否有变化
      if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      
      this.grid[i] = row;
    }
    
    return moved;
  }

  // 向右移动
  moveRight() {
    let moved = false;
    
    for (let i = 0; i < this.size; i++) {
      const row = this.grid[i].filter(val => val !== 0);
      
      // 合并相同数字
      for (let j = row.length - 1; j > 0; j--) {
        if (row[j] === row[j - 1]) {
          row[j] *= 2;
          this.lastScore += row[j];
          this.score += row[j];
          row.splice(j - 1, 1);
          j--;
          moved = true;
        }
      }
      
      // 在前面填充0
      while (row.length < this.size) {
        row.unshift(0);
      }
      
      if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      
      this.grid[i] = row;
    }
    
    return moved;
  }

  // 向上移动
  moveUp() {
    let moved = false;
    
    for (let j = 0; j < this.size; j++) {
      const col = [];
      for (let i = 0; i < this.size; i++) {
        if (this.grid[i][j] !== 0) {
          col.push(this.grid[i][j]);
        }
      }
      
      // 合并相同数字
      for (let i = 0; i < col.length - 1; i++) {
        if (col[i] === col[i + 1]) {
          col[i] *= 2;
          this.lastScore += col[i];
          this.score += col[i];
          col.splice(i + 1, 1);
          moved = true;
        }
      }
      
      // 填充0
      while (col.length < this.size) {
        col.push(0);
      }
      
      // 更新列
      for (let i = 0; i < this.size; i++) {
        if (this.grid[i][j] !== col[i]) {
          moved = true;
        }
        this.grid[i][j] = col[i];
      }
    }
    
    return moved;
  }

  // 向下移动
  moveDown() {
    let moved = false;
    
    for (let j = 0; j < this.size; j++) {
      const col = [];
      for (let i = 0; i < this.size; i++) {
        if (this.grid[i][j] !== 0) {
          col.push(this.grid[i][j]);
        }
      }
      
      // 合并相同数字
      for (let i = col.length - 1; i > 0; i--) {
        if (col[i] === col[i - 1]) {
          col[i] *= 2;
          this.lastScore += col[i];
          this.score += col[i];
          col.splice(i - 1, 1);
          i--;
          moved = true;
        }
      }
      
      // 在前面填充0
      while (col.length < this.size) {
        col.unshift(0);
      }
      
      // 更新列
      for (let i = 0; i < this.size; i++) {
        if (this.grid[i][j] !== col[i]) {
          moved = true;
        }
        this.grid[i][j] = col[i];
      }
    }
    
    return moved;
  }

  // 检查游戏是否结束
  isGameOver() {
    // 检查是否有空格
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j] === 0) {
          return false;
        }
      }
    }
    
    // 检查是否有可合并的相邻数字
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const current = this.grid[i][j];
        
        // 检查右边
        if (j < this.size - 1 && current === this.grid[i][j + 1]) {
          return false;
        }
        
        // 检查下边
        if (i < this.size - 1 && current === this.grid[i + 1][j]) {
          return false;
        }
      }
    }
    
    return true;
  }

  // 检查是否获胜(达到2048)
  isWon() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j] === 2048) {
          return true;
        }
      }
    }
    return false;
  }
}

export default Game2048;