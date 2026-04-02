<template>
  <view class="container">
    <!-- 顶部信息栏 -->
    <view class="header">
      <view class="title">2048</view>
      <view class="score-box">
        <text class="score-label">得分</text>
        <text class="score-value">{{ score }}</text>
      </view>
      <view class="score-box">
        <text class="score-label">最高</text>
        <text class="score-value">{{ bestScore }}</text>
      </view>
      <view class="btn-restart" @click="restartGame">
        <text>新游戏</text>
      </view>
    </view>
    
    <!-- 游戏画布 -->
    <canvas 
      id="gameCanvas" 
      class="game-canvas"
      type="2d"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    />
    
    <!-- 游戏结束提示 -->
    <view class="game-over" v-if="isGameOver">
      <view class="game-over-content">
        <text class="game-over-title">游戏结束!</text>
        <text class="game-over-score">最终得分: {{ score }}</text>
        <view class="btn-restart-large" @click="restartGame">
          <text>再来一局</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Game2048 from './index.js';

export default {
  data() {
    return {
      score: 0,
      bestScore: 0,
      isGameOver: false,
      ctx: null,
      game: null,
      touchStartX: null,
      touchStartY: null
    };
  },
  onLoad() {
    this.initGame();
  },
  onReady() {
    this.createCanvasContext();
  },
  methods: {
    initGame() {
      // 读取历史最高分
      const bestScore = my.getStorageSync({ key: 'bestScore_2048' });
      this.bestScore = bestScore ? bestScore.data : 0;
      
      this.game = new Game2048(4, 4);
      this.score = 0;
      this.isGameOver = false;
      this.game.start();
      this.draw();
    },
    
    createCanvasContext() {
      const query = my.createSelectorQuery();
      query.select('#gameCanvas').boundingClientRect();
      query.exec((res) => {
        if (res && res[0]) {
          const canvas = my.createCanvasContext('gameCanvas');
          this.ctx = canvas;
          this.draw();
        }
      });
    },
    
    draw() {
      if (!this.ctx || !this.game) return;
      
      const ctx = this.ctx;
      const grid = this.game.grid;
      const cellSize = 50;
      const gap = 8;
      const startX = 20;
      const startY = 20;
      
      // 清空画布
      ctx.clearRect(0, 0, 1024, 240);
      
      // 绘制背景
      ctx.setFillStyle('#1a1a2e');
      ctx.fillRect(0, 0, 1024, 240);
      
      // 绘制游戏区域背景
      ctx.setFillStyle('#2d2d44');
      ctx.fillRect(startX - 5, startY - 5, cellSize * 4 + gap * 3 + 10, cellSize * 4 + gap * 3 + 10);
      
      // 绘制每个格子
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const x = startX + j * (cellSize + gap);
          const y = startY + i * (cellSize + gap);
          const value = grid[i][j];
          
          // 绘制格子背景
          ctx.setFillStyle(value === 0 ? '#3d3d5c' : this.getTileColor(value));
          ctx.fillRect(x, y, cellSize, cellSize);
          
          // 绘制数字
          if (value !== 0) {
            ctx.setFillStyle(value <= 4 ? '#ffffff' : '#ffffff');
            ctx.setFontSize(value >= 100 ? 20 : 24);
            ctx.setTextAlign('center');
            ctx.setTextBaseline('middle');
            ctx.fillText(value.toString(), x + cellSize / 2, y + cellSize / 2);
          }
        }
      }
      
      ctx.draw();
    },
    
    getTileColor(value) {
      const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
      };
      return colors[value] || '#3c3a32';
    },
    
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    },
    
    handleTouchMove(e) {
      e.preventDefault();
    },
    
    handleTouchEnd(e) {
      if (!this.touchStartX || !this.touchStartY) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const diffX = touchEndX - this.touchStartX;
      const diffY = touchEndY - this.touchStartY;
      
      let direction = null;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) {
          direction = diffX > 0 ? 'right' : 'left';
        }
      } else {
        if (Math.abs(diffY) > 30) {
          direction = diffY > 0 ? 'down' : 'up';
        }
      }
      
      if (direction) {
        this.move(direction);
      }
      
      this.touchStartX = null;
      this.touchStartY = null;
    },
    
    move(direction) {
      if (this.isGameOver) return;
      
      const moved = this.game.move(direction);
      
      if (moved) {
        this.score += this.game.lastScore;
        this.draw();
        
        // 更新最高分
        if (this.score > this.bestScore) {
          this.bestScore = this.score;
          my.setStorageSync({
            key: 'bestScore_2048',
            data: this.bestScore
          });
        }
        
        // 检查游戏是否结束
        if (this.game.isGameOver()) {
          this.isGameOver = true;
        }
      }
    },
    
    restartGame() {
      this.initGame();
      this.draw();
    }
  }
};
</script>

<style>
.container {
  width: 1024px;
  height: 240px;
  background-color: #1a1a2e;
  display: flex;
  flex-direction: column;
}

.header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #2d2d44;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #edc22e;
}

.score-box {
  background-color: #3d3d5c;
  padding: 5px 15px;
  border-radius: 5px;
  text-align: center;
}

.score-label {
  font-size: 12px;
  color: #aaa;
  display: flex;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.btn-restart {
  background-color: #f67c5f;
  padding: 8px 20px;
  border-radius: 5px;
  color: #fff;
  font-size: 14px;
}

.game-canvas {
  width: 1024px;
  height: 190px;
  background-color: #1a1a2e;
}

.game-over {
  position: absolute;
  top: 0;
  left: 0;
  width: 1024px;
  height: 240px;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-over-content {
  background-color: #2d2d44;
  padding: 30px 50px;
  border-radius: 10px;
  text-align: center;
}

.game-over-title {
  font-size: 36px;
  font-weight: bold;
  color: #f67c5f;
  display: flex;
  margin-bottom: 15px;
}

.game-over-score {
  font-size: 24px;
  color: #fff;
  display: flex;
  margin-bottom: 20px;
}

.btn-restart-large {
  background-color: #edc22e;
  padding: 15px 40px;
  border-radius: 5px;
  color: #1a1a2e;
  font-size: 18px;
  font-weight: bold;
}
</style>