<template>
  <div class="game-shell">
    <div class="info-panel">
      <div class="brand-row">
        <text class="brand">2048</text>
        <div class="brand-mark"></div>
      </div>

      <div class="stats-row">
        <div class="stat-box">
          <text class="stat-label">分数</text>
          <text class="stat-value">{{ score }}</text>
        </div>
        <div class="stat-box stat-box-last">
          <text class="stat-label">步数</text>
          <text class="stat-value">{{ moves }}</text>
        </div>
      </div>

      <div class="new-game-button" @click="startGame">
        <text class="new-game-text">新棋局</text>
      </div>
      <text class="round-note">每一步，都让数字更接近目标。</text>
    </div>

    <div
      class="board"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
        <div
          v-for="(value, columnIndex) in row"
          :key="rowIndex + '-' + columnIndex + '-' + value"
          :class="tileClass(value)"
        >
          <text :class="tileTextClass(value)">{{ value || '' }}</text>
        </div>
      </div>

      <div v-if="status !== 'playing'" class="board-overlay">
        <div class="result-dialog">
          <text class="result-title">{{ resultTitle }}</text>
          <text class="result-score">得分 {{ score }}</text>
          <div class="result-button" @click="handleResultAction">
            <text class="result-button-text">{{ resultButtonText }}</text>
          </div>
        </div>
      </div>
    </div>

    <div class="side-panel">
      <div class="progress-panel">
        <text class="section-label">当前最大</text>
        <text class="max-tile">{{ maxTile }}</text>
        <div class="progress-track">
          <div class="progress-fill" :style="progressStyle"></div>
        </div>
        <div class="progress-scale">
          <text class="scale-value">2</text>
          <text class="scale-value scale-middle">128</text>
          <text class="scale-value">2048</text>
        </div>
        <text class="status-text">{{ statusText }}</text>
      </div>

      <div class="controls-panel">
        <text class="section-label controls-label">方向</text>
        <div class="control-row control-row-top">
          <div class="direction-button" @click="move('up')">
            <text class="direction-icon">↑</text>
          </div>
        </div>
        <div class="control-row">
          <div class="direction-button" @click="move('left')">
            <text class="direction-icon">←</text>
          </div>
          <div class="control-center">
            <div class="center-dot"></div>
          </div>
          <div class="direction-button" @click="move('right')">
            <text class="direction-icon">→</text>
          </div>
        </div>
        <div class="control-row">
          <div class="direction-button" @click="move('down')">
            <text class="direction-icon">↓</text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  addRandomTile,
  canMove,
  createEmptyBoard,
  getMaxTile,
  moveBoard,
} from '@/game-logic.js'

export default {
  name: 'index',
  data() {
    return {
      board: createEmptyBoard(),
      score: 0,
      moves: 0,
      status: 'playing',
      reachedGoal: false,
      touchStartX: 0,
      touchStartY: 0,
      keyHandler: null,
    }
  },
  computed: {
    maxTile() {
      return getMaxTile(this.board)
    },
    progressStyle() {
      const level = Math.max(1, Math.log(this.maxTile || 2) / Math.LN2)
      const width = Math.min(220, Math.round((level / 11) * 220))
      return { width: width + 'px' }
    },
    statusText() {
      if (this.status === 'won') return '目标已达成'
      if (this.status === 'over') return '本局已结束'
      return '棋局进行中'
    },
    resultTitle() {
      return this.status === 'won' ? '2048!' : '无路可走'
    },
    resultButtonText() {
      return this.status === 'won' ? '继续挑战' : '再来一局'
    },
  },
  mounted() {
    this.startGame()
    if (typeof document !== 'undefined') {
      this.keyHandler = event => {
        const keyMap = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right',
        }
        if (keyMap[event.key]) {
          if (event.preventDefault) event.preventDefault()
          this.move(keyMap[event.key])
        }
      }
      document.addEventListener('keydown', this.keyHandler)
    }
  },
  beforeDestroy() {
    if (typeof document !== 'undefined' && this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler)
    }
  },
  methods: {
    startGame() {
      let board = createEmptyBoard()
      board = addRandomTile(board)
      board = addRandomTile(board)
      this.board = board
      this.score = 0
      this.moves = 0
      this.status = 'playing'
      this.reachedGoal = false
    },
    move(direction) {
      if (this.status !== 'playing') return

      const result = moveBoard(this.board, direction)
      if (!result.changed) return

      this.board = addRandomTile(result.board)
      this.score += result.gained
      this.moves += 1

      if (!this.reachedGoal && getMaxTile(this.board) >= 2048) {
        this.reachedGoal = true
        this.status = 'won'
      } else if (!canMove(this.board)) {
        this.status = 'over'
      }
    },
    handleResultAction() {
      if (this.status === 'won') {
        this.status = canMove(this.board) ? 'playing' : 'over'
      } else {
        this.startGame()
      }
    },
    tileClass(value) {
      if (value === 0) return 'tile tile-empty'
      if (value > 2048) return 'tile tile-super'
      return 'tile tile-' + value
    },
    tileTextClass(value) {
      if (value >= 1024) return 'tile-text tile-text-small'
      if (value >= 128) return 'tile-text tile-text-medium'
      return 'tile-text'
    },
    getTouchPoint(event) {
      const touches = event.changedTouches || event.touches
      if (!touches || !touches[0]) return null
      return {
        x: touches[0].pageX,
        y: touches[0].pageY,
      }
    },
    onTouchStart(event) {
      const point = this.getTouchPoint(event)
      if (!point) return
      this.touchStartX = point.x
      this.touchStartY = point.y
    },
    onTouchMove(event) {
      if (event.preventDefault) event.preventDefault()
    },
    onTouchEnd(event) {
      const point = this.getTouchPoint(event)
      if (!point) return

      const deltaX = point.x - this.touchStartX
      const deltaY = point.y - this.touchStartY
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 20) return

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.move(deltaX > 0 ? 'right' : 'left')
      } else {
        this.move(deltaY > 0 ? 'down' : 'up')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.game-shell {
  width: 1048px;
  height: 240px;
  padding: 12px 16px;
  flex-direction: row;
  align-items: center;
  background-color: #eef1ef;
  overflow: hidden;
}

.info-panel {
  width: 276px;
  height: 216px;
  margin-right: 16px;
  justify-content: flex-start;
}

.brand-row {
  height: 58px;
  flex-direction: row;
  align-items: center;
}

.brand {
  height: 58px;
  font-size: 54px;
  line-height: 60px;
  font-weight: 700;
  color: #243331;
}

.brand-mark {
  width: 34px;
  height: 8px;
  margin-left: 12px;
  background-color: #e65d4f;
  border-radius: 4px;
}

.stats-row {
  height: 58px;
  margin-top: 8px;
  flex-direction: row;
}

.stat-box {
  width: 130px;
  height: 58px;
  padding: 7px 12px;
  background-color: #d8dfdc;
  border-radius: 6px;
}

.stat-box-last {
  margin-left: 10px;
}

.stat-label {
  height: 16px;
  font-size: 12px;
  line-height: 16px;
  color: #64716e;
}

.stat-value {
  height: 28px;
  font-size: 25px;
  line-height: 30px;
  font-weight: 700;
  color: #243331;
}

.new-game-button {
  width: 270px;
  height: 38px;
  margin-top: 10px;
  align-items: center;
  justify-content: center;
  background-color: #243331;
  border-radius: 6px;
}

.new-game-button:active {
  background-color: #e65d4f;
  transform: scale(0.98);
}

.new-game-text {
  height: 24px;
  font-size: 17px;
  line-height: 25px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.round-note {
  height: 18px;
  margin-top: 7px;
  font-size: 12px;
  line-height: 18px;
  color: #71807c;
}

.board {
  width: 216px;
  height: 216px;
  padding: 4px;
  position: relative;
  background-color: #344846;
  border-radius: 6px;
}

.board-row {
  width: 208px;
  height: 52px;
  flex-direction: row;
}

.tile {
  width: 48px;
  height: 48px;
  margin: 2px;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  animation-name: tile-pop;
  animation-duration: 120ms;
  animation-timing-function: ease-out;
}

.tile-empty { background-color: #506360; }
.tile-2 { background-color: #dfe9e7; }
.tile-4 { background-color: #c5dcd6; }
.tile-8 { background-color: #f2b85f; }
.tile-16 { background-color: #ef8c57; }
.tile-32 { background-color: #e66550; }
.tile-64 { background-color: #d84d3f; }
.tile-128 { background-color: #d6b347; }
.tile-256 { background-color: #c69b2e; }
.tile-512 { background-color: #a77f25; }
.tile-1024 { background-color: #2d8f88; }
.tile-2048 { background-color: #246b67; }
.tile-super { background-color: #192f31; }

.tile-text {
  width: 48px;
  height: 48px;
  font-size: 23px;
  line-height: 50px;
  font-weight: 700;
  color: #243331;
  text-align: center;
}

.tile-8 .tile-text,
.tile-16 .tile-text,
.tile-32 .tile-text,
.tile-64 .tile-text,
.tile-128 .tile-text,
.tile-256 .tile-text,
.tile-512 .tile-text,
.tile-1024 .tile-text,
.tile-2048 .tile-text,
.tile-super .tile-text {
  color: #ffffff;
}

.tile-text-medium { font-size: 18px; }
.tile-text-small { font-size: 14px; }

.board-overlay {
  width: 216px;
  height: 216px;
  position: absolute;
  left: 0px;
  top: 0px;
  align-items: center;
  justify-content: center;
  background-color: rgba(24, 39, 37, 0.82);
  border-radius: 6px;
}

.result-dialog {
  width: 164px;
  height: 126px;
  padding: 12px;
  align-items: center;
  background-color: #f7f9f8;
  border-radius: 6px;
}

.result-title {
  height: 34px;
  font-size: 27px;
  line-height: 36px;
  font-weight: 700;
  color: #243331;
  text-align: center;
}

.result-score {
  height: 20px;
  margin-top: 2px;
  font-size: 13px;
  line-height: 20px;
  color: #6a7774;
  text-align: center;
}

.result-button {
  width: 136px;
  height: 34px;
  margin-top: 8px;
  align-items: center;
  justify-content: center;
  background-color: #e65d4f;
  border-radius: 5px;
}

.result-button:active { transform: scale(0.97); }

.result-button-text {
  height: 22px;
  font-size: 15px;
  line-height: 23px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.side-panel {
  width: 492px;
  height: 216px;
  margin-left: 16px;
  flex-direction: row;
}

.progress-panel {
  width: 270px;
  height: 216px;
  padding: 6px 0px;
}

.section-label {
  height: 20px;
  font-size: 13px;
  line-height: 20px;
  font-weight: 700;
  color: #71807c;
}

.max-tile {
  height: 68px;
  margin-top: 2px;
  font-size: 58px;
  line-height: 70px;
  font-weight: 700;
  color: #243331;
}

.progress-track {
  width: 220px;
  height: 8px;
  margin-top: 12px;
  background-color: #d3dad7;
  border-radius: 4px;
}

.progress-fill {
  height: 8px;
  background-color: #e65d4f;
  border-radius: 4px;
  transition-property: width;
  transition-duration: 180ms;
  transition-timing-function: ease-out;
}

.progress-scale {
  width: 220px;
  height: 20px;
  margin-top: 3px;
  flex-direction: row;
  justify-content: space-between;
}

.scale-value {
  height: 18px;
  font-size: 11px;
  line-height: 18px;
  color: #85918e;
}

.scale-middle { margin-left: 14px; }

.status-text {
  width: 220px;
  height: 32px;
  margin-top: 18px;
  padding: 5px 10px;
  font-size: 14px;
  line-height: 22px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  background-color: #2d8f88;
  border-radius: 5px;
}

.controls-panel {
  width: 190px;
  height: 216px;
  margin-left: 32px;
  padding-top: 6px;
  align-items: center;
}

.controls-label {
  width: 190px;
  text-align: center;
}

.control-row {
  width: 174px;
  height: 54px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.control-row-top { margin-top: 4px; }

.direction-button,
.control-center {
  width: 54px;
  height: 54px;
  margin: 2px;
  align-items: center;
  justify-content: center;
}

.direction-button {
  background-color: #243331;
  border-radius: 6px;
}

.direction-button:active {
  background-color: #e65d4f;
  transform: scale(0.94);
}

.direction-icon {
  width: 54px;
  height: 54px;
  font-size: 28px;
  line-height: 56px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.control-center {
  background-color: #d8dfdc;
  border-radius: 6px;
}

.center-dot {
  width: 10px;
  height: 10px;
  background-color: #83908d;
  border-radius: 5px;
}

@keyframes tile-pop {
  from { transform: scale(0.88); }
  to { transform: scale(1); }
}
</style>
