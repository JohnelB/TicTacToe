import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const initialBoard = Array(9).fill(null);

const TicTacToePower = () => {
  // Stage to check if game started or still in setup
  const [gameStarted, setGameStarted] = useState(false);

  // Player info: name and color for X and O
  const [player1, setPlayer1] = useState({ name: "", color: "#FF0000" });
  const [player2, setPlayer2] = useState({ name: "", color: "#0000FF" });

  const [board, setBoard] = useState(initialBoard);
  const [history, setHistory] = useState([]);
  const [isXTurn, setIsXTurn] = useState(true);
  const [usedUndo, setUsedUndo] = useState({ X: false, O: false });
  const [shuffleUsed, setShuffleUsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef(null);
  const hasCelebrated = useRef(false);

  const currentPlayer = isXTurn ? "X" : "O";
  const winner = calculateWinner(board);

  // Start the game when form submitted
  const startGame = (e) => {
    e.preventDefault();
    if (player1.name.trim() && player2.name.trim()) {
      setGameStarted(true);
    } else {
      alert("Please enter names for both players");
    }
  };

  // Reset the game and go back to start screen
  const resetToStart = () => {
    setGameStarted(false);
    setBoard(initialBoard);
    setHistory([]);
    setIsXTurn(true);
    setUsedUndo({ X: false, O: false });
    setShuffleUsed(false);
    setTimeLeft(5);
    hasCelebrated.current = false;
  };

  useEffect(() => {
    if (winner && !hasCelebrated.current) {
      hasCelebrated.current = true;

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }

    if (!winner) {
      hasCelebrated.current = false; // reset for next game
    }
  }, [winner]);

  useEffect(() => {
    if (winner || board.every(Boolean)) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          skipTurn();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isXTurn, board]);

  const skipTurn = () => {
    setIsXTurn(!isXTurn);
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = board.slice();
    newBoard[index] = currentPlayer;

    setHistory((prev) => [...prev, board]);
    setBoard(newBoard);
    setIsXTurn(!isXTurn);
    setTimeLeft(5);
  };

  const handleUndo = () => {
    if (usedUndo[currentPlayer] || history.length === 0) return;

    const lastBoard = history[history.length - 1];
    setBoard(lastBoard);
    setHistory(history.slice(0, -1));
    setUsedUndo({ ...usedUndo, [currentPlayer]: true });
  };

  const handleShuffle = () => {
    if (shuffleUsed || winner) return;

    const shuffled = [...board]
      .map((value) => [Math.random(), value])
      .sort()
      .map(([, value]) => value);

    setBoard(shuffled);
    setShuffleUsed(true);
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setHistory([]);
    setIsXTurn(true);
    setUsedUndo({ X: false, O: false });
    setShuffleUsed(false);
    setTimeLeft(5);
  };

  // Get color for the mark (X or O)
  const getMarkColor = (mark) => {
    return mark === "X" ? player1.color : player2.color;
  };

  // Get current player's name
  const getCurrentPlayerName = () => {
    return isXTurn ? player1.name : player2.name;
  };

  return (
    <div className="power-app">
      {!gameStarted ? (
        <form className="start-form" onSubmit={startGame}>
          <header className="start-header">JB's TIC - TAC - TOE</header>
          <h2>Enter Player Names & Pick Colors</h2>
          <div className="player-inputs">
            <div>
              <label>
                Player 1 Name (X):
                <input
                  type="text"
                  value={player1.name}
                  onChange={(e) =>
                    setPlayer1((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Choose Color:
                <input
                  type="color"
                  value={player1.color}
                  onChange={(e) =>
                    setPlayer1((p) => ({ ...p, color: e.target.value }))
                  }
                />
              </label>
            </div>
            <div>
              <label>
                Player 2 Name (O):
                <input
                  type="text"
                  value={player2.name}
                  onChange={(e) =>
                    setPlayer2((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Choose Color:
                <input
                  type="color"
                  value={player2.color}
                  onChange={(e) =>
                    setPlayer2((p) => ({ ...p, color: e.target.value }))
                  }
                />
              </label>
            </div>
          </div>
          <button type="submit">Start Game</button>
        </form>
      ) : (
        <>
          <h1>Tic-Tac-Toe: Power Mode</h1>
          <p className="status">
            {winner
              ? `🎉 Winner: ${
                  winner === "X" ? player1.name : player2.name
                }`
              : board.every(Boolean)
              ? "It's a Draw!"
              : `Turn: ${getCurrentPlayerName()} (${timeLeft}s)`}
          </p>
          <div className="board">
            {board.map((value, idx) => (
              <div
                key={idx}
                className={`cell ${value ? "filled" : ""}`}
                onClick={() => handleClick(idx)}
                style={{ color: getMarkColor(value) }}
              >
                {value}
              </div>
            ))}
          </div>
          <div className="controls">
            <button
              onClick={handleUndo}
              disabled={usedUndo[currentPlayer] || history.length === 0}
            >
              🔙 Undo
            </button>
            <button onClick={handleShuffle} disabled={shuffleUsed}>
              🔀 Shuffle Board
            </button>
            <button onClick={resetGame}>🔄 Restart</button>
            <button onClick={resetToStart}>🏠 Change Players</button>
          </div>
        </>
      )}
    </div>
  );
};

function calculateWinner(squares) {
  const combos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let [a, b, c] of combos) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default TicTacToePower;
