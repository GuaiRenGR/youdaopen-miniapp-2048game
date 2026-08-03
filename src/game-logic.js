export function createEmptyBoard() {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
}

function cloneBoard(board) {
  return board.map(row => row.slice())
}

function collapseLine(line) {
  const values = line.filter(value => value !== 0)
  const result = []
  let gained = 0

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const merged = values[index] * 2
      result.push(merged)
      gained += merged
      index += 1
    } else {
      result.push(values[index])
    }
  }

  while (result.length < 4) {
    result.push(0)
  }

  return { line: result, gained }
}

function readLine(board, direction, index) {
  const line = []
  let offset

  for (offset = 0; offset < 4; offset += 1) {
    if (direction === 'left') line.push(board[index][offset])
    if (direction === 'right') line.push(board[index][3 - offset])
    if (direction === 'up') line.push(board[offset][index])
    if (direction === 'down') line.push(board[3 - offset][index])
  }

  return line
}

function writeLine(board, direction, index, line) {
  let offset

  for (offset = 0; offset < 4; offset += 1) {
    if (direction === 'left') board[index][offset] = line[offset]
    if (direction === 'right') board[index][3 - offset] = line[offset]
    if (direction === 'up') board[offset][index] = line[offset]
    if (direction === 'down') board[3 - offset][index] = line[offset]
  }
}

function boardsEqual(first, second) {
  let row
  let column

  for (row = 0; row < 4; row += 1) {
    for (column = 0; column < 4; column += 1) {
      if (first[row][column] !== second[row][column]) return false
    }
  }

  return true
}

export function moveBoard(board, direction) {
  const nextBoard = cloneBoard(board)
  let gained = 0
  let index

  for (index = 0; index < 4; index += 1) {
    const collapsed = collapseLine(readLine(board, direction, index))
    writeLine(nextBoard, direction, index, collapsed.line)
    gained += collapsed.gained
  }

  return {
    board: nextBoard,
    changed: !boardsEqual(board, nextBoard),
    gained,
  }
}

export function addRandomTile(board, random) {
  const nextBoard = cloneBoard(board)
  const emptyCells = []
  const randomValue = random || Math.random
  let row
  let column

  for (row = 0; row < 4; row += 1) {
    for (column = 0; column < 4; column += 1) {
      if (nextBoard[row][column] === 0) emptyCells.push([row, column])
    }
  }

  if (emptyCells.length === 0) return nextBoard

  const target = emptyCells[Math.floor(randomValue() * emptyCells.length)]
  nextBoard[target[0]][target[1]] = randomValue() < 0.9 ? 2 : 4
  return nextBoard
}

export function canMove(board) {
  let row
  let column

  for (row = 0; row < 4; row += 1) {
    for (column = 0; column < 4; column += 1) {
      if (board[row][column] === 0) return true
      if (column < 3 && board[row][column] === board[row][column + 1]) return true
      if (row < 3 && board[row][column] === board[row + 1][column]) return true
    }
  }

  return false
}

export function getMaxTile(board) {
  let maximum = 0
  let row
  let column

  for (row = 0; row < 4; row += 1) {
    for (column = 0; column < 4; column += 1) {
      if (board[row][column] > maximum) maximum = board[row][column]
    }
  }

  return maximum
}
