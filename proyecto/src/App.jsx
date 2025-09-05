import React, { useState } from "react";

// === utilidades de sudoku ===
const range = (n) => [...Array(n).keys()];
const clone = (m) => m.map((r) => [...r]);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function isValid(board, r, c, val) {
  if (val === 0) return true;
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === val && i !== c) return false;
    if (board[i][c] === val && i !== r) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if ((i !== r || j !== c) && board[i][j] === val) return false;
    }
  }
  return true;
}
function solve(board) {
  const grid = clone(board);
  function backtrack(pos = 0) {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    if (grid[r][c] !== 0) return backtrack(pos + 1);
    for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isValid(grid, r, c, n)) {
        grid[r][c] = n;
        if (backtrack(pos + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }
  const ok = backtrack(0);
  return ok ? grid : null;
}
function generateSolved() {
  const empty = range(9).map(() => range(9).map(() => 0));
  const seed = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  empty[0] = [...seed];
  return solve(empty);
}
function makePuzzle(solved, difficulty = "medium") {
  const holesByDiff = { easy: 41, medium: 49, hard: 55, expert: 60 };
  const holes = holesByDiff[difficulty] ?? holesByDiff.medium;
  const puzzle = clone(solved);
  const cells = shuffle(range(81));
  let removed = 0;
  for (const idx of cells) {
    if (removed >= holes) break;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    const trySolve = solve(puzzle);
    if (trySolve) removed++;
    else puzzle[r][c] = backup;
  }
  const givens = puzzle.map((row) => row.map((v) => v !== 0));
  return { puzzle, givens };
}

// === componente principal ===
export default function App() {
  const [difficulty, setDifficulty] = useState("medium");
  const [solved, setSolved] = useState(generateSolved);
  const [{ puzzle, givens }, setPuzzlePack] = useState(() =>
    makePuzzle(generateSolved(), difficulty)
  );
  const [board, setBoard] = useState(() => clone(puzzle));
  const [selected, setSelected] = useState({ r: 0, c: 0 });

  function newGame(diff = difficulty) {
    const solvedNew = generateSolved();
    const pack = makePuzzle(solvedNew, diff);
    setSolved(solvedNew);
    setPuzzlePack(pack);
    setBoard(clone(pack.puzzle));
    setSelected({ r: 0, c: 0 });
  }

  function handleNumberInput(n) {
    const { r, c } = selected;
    if (givens[r][c]) return; // no modificar celdas fijas
    setBoard((b) => {
      const next = clone(b);
      next[r][c] = n;
      return next;
    });
  }

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <h1>🧩 Sudoku</h1>

        {/* tablero */}
        <div className="board">
          {range(9).map((r) => (
            <div key={r} className="row">
              {range(9).map((c) => {
                const v = board[r][c];
                const isGiven = givens[r][c];
                const isSelected = selected.r === r && selected.c === c;
                return (
                  <button
                    key={c}
                    className={`cell ${isGiven ? "given" : "editable"} 
                      ${isSelected ? "selected" : ""} 
                      ${r % 3 === 2 ? "border-bottom" : ""} 
                      ${c % 3 === 2 ? "border-right" : ""}`}
                    onClick={() => setSelected({ r, c })}
                  >
                    {v !== 0 ? v : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* teclado numérico */}
        <div className="pad">
          {range(9).map((i) => (
            <button
              key={i + 1}
              className="key"
              onClick={() => handleNumberInput(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button className="key del" onClick={() => handleNumberInput(0)}>
            ⌫
          </button>
        </div>

        {/* controles */}
        <div className="controls">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Fácil</option>
            <option value="medium">Media</option>
            <option value="hard">Difícil</option>
            <option value="expert">Experto</option>
          </select>
          <button onClick={() => newGame(difficulty)}>Nueva partida</button>
        </div>
      </div>
    </>
  );
}

// === estilos fusionados ===
const css = `
body {
  margin:0;
  font-family: "Segoe UI", sans-serif;
  background:#0f1220;
  color:#fff;
  display:flex;
  justify-content:center;
}
.wrap {
  width:100%;
  max-width:600px;
  padding:12px;
}
h1 { 
  text-align:center; 
  margin-bottom:16px; 
  font-size: clamp(20px, 5vw, 28px);
}

.board {
  width:100%;
  aspect-ratio:1/1;
  display:grid;
  grid-template-rows: repeat(9,1fr);
  margin:0 auto 16px;
  border:3px solid #5b8cff;
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 4px 14px rgba(0,0,0,0.5);
}
.row {
  display:grid;
  grid-template-columns: repeat(9,1fr);
}
.cell {
  background:#1e2239;
  border:1px solid #2a2f4c;
  color:#fff;
  font-weight:bold;
  font-size:clamp(16px, 3vw, 26px);
  display:flex;
  justify-content:center;
  align-items:center;
  transition: background 0.2s, transform 0.1s;
}
.cell.given { background:#2d3254; color:#9fb4ff; }
.cell.editable { cursor:pointer; }
.cell.selected {
  background:#2d3254;
  outline:2px solid #5b8cff;
  transform: scale(1.05);
}
.border-right {
  border-right:3px solid #5b8cff;
}
.border-bottom {
  border-bottom:3px solid #5b8cff;
}

.pad {
  display:grid;
  grid-template-columns: repeat(5,1fr);
  gap:10px;
  margin:14px auto;
}
.key {
  padding:14px;
  font-size:20px;
  border:none;
  border-radius:10px;
  background:#5b8cff;
  color:#fff;
  font-weight:bold;
  box-shadow:0 3px 6px rgba(0,0,0,0.3);
  transition: transform 0.1s, filter 0.2s;
}
.key.del { background:#ff6b7a; }
.key:active { 
  filter:brightness(1.2); 
  transform:scale(0.95); 
}

.controls {
  display:flex;
  justify-content:center;
  gap:10px;
  margin-top:10px;
}
.controls button, .controls select {
  padding:10px;
  border-radius:6px;
  border:none;
}
`;
