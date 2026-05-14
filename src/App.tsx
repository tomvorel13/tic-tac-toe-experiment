import { Index, createMemo, createSignal } from 'solid-js'
import './App.css'

type CellValue = 'X' | 'O' | null

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const

const emptyBoard = (): CellValue[] => Array.from({ length: 9 }, () => null)

function outcomeFromBoard(cells: CellValue[]) {
  for (const line of WINNING_LINES) {
    const first = cells[line[0]]
    if (first && first === cells[line[1]] && first === cells[line[2]]) {
      return { kind: 'win' as const, winner: first, line: [...line] }
    }
  }
  if (cells.every((cell) => cell !== null)) {
    return { kind: 'draw' as const }
  }
  return null
}

function App() {
  const [boardCells, setBoardCells] = createSignal<CellValue[]>(emptyBoard())
  const [nextMark, setNextMark] = createSignal<'X' | 'O'>('X')

  const outcome = createMemo(() => outcomeFromBoard(boardCells()))

  const statusMessage = createMemo(() => {
    const resolved = outcome()
    if (resolved?.kind === 'win') {
      return `${resolved.winner} wins`
    }
    if (resolved?.kind === 'draw') {
      return "It's a draw"
    }
    return `${nextMark()}'s turn`
  })

  const winningIndexSet = createMemo(() => {
    const resolved = outcome()
    if (resolved?.kind !== 'win') return null
    return new Set<number>(resolved.line)
  })

  function handleCellClick(cellIndex: number) {
    if (cellIndex < 0 || cellIndex > 8) return
    if (outcome()) return
    if (boardCells()[cellIndex]) return

    setBoardCells((currentBoard) => {
      const updatedBoard = [...currentBoard]
      updatedBoard[cellIndex] = nextMark()
      return updatedBoard
    })
    setNextMark((currentMark) => (currentMark === 'X' ? 'O' : 'X'))
  }

  function startNewGame() {
    setBoardCells(emptyBoard())
    setNextMark('X')
  }

  return (
    <main class="game">
      <header class="game-header">
        <h1 class="game-title">Tic Tac Toe</h1>
        <p class="game-status" role="status">
          {statusMessage()}
        </p>
      </header>

      <div
        class="board"
        role="grid"
        aria-label="Tic tac toe board"
        classList={{ 'board--finished': Boolean(outcome()) }}
      >
        <Index each={boardCells()}>
          {(cellValue, cellIndex) => (
            <button
              type="button"
              class="cell"
              classList={{
                'cell--x': cellValue() === 'X',
                'cell--o': cellValue() === 'O',
                'cell--winning': winningIndexSet()?.has(cellIndex) ?? false,
              }}
              aria-label={
                cellValue()
                  ? `Cell ${cellIndex + 1}, ${cellValue()}`
                  : `Cell ${cellIndex + 1}, empty`
              }
              disabled={Boolean(cellValue()) || Boolean(outcome())}
              onClick={() => handleCellClick(cellIndex)}
            >
              {cellValue() ?? ''}
            </button>
          )}
        </Index>
      </div>

      <button type="button" class="new-game" onClick={startNewGame}>
        New game
      </button>
    </main>
  )
}

export default App
