// chess-game.js

let board = null;
let game = null;

function onDragStart(source, piece, position, orientation) {
  // Prevent dragging if game over or not player's turn
  if (game.game_over() || (game.turn() !== 'w')) {
    return false;
  }
}

function onDrop(source, target) {
  // See if the move is legal
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q' // always promote to queen for simplicity
  });

  if (move === null) {
    return 'snapback'; // illegal move
  }

  updateStatus();
}

function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  let status = '';

  if (game.in_checkmate()) {
    status = 'Game over, checkmate.';
  } else if (game.in_draw()) {
    status = 'Game over, draw.';
  } else {
    status = (game.turn() === 'w' ? 'White' : 'Black') + ' to move';

    if (game.in_check()) {
      status += ', check!';
    }
  }

  // You can display this status in your terminal output or somewhere else
  console.log(status);
}

function resetChessGame() {
  game = new Chess();
  if (board) {
    board.position('start');
  }
  updateStatus();
}

function startChessBoard() {
  const config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
  };
  board = Chessboard('board', config);
  resetChessGame();
}

// Function to handle moves typed by user in terminal input like "e2e4"
function userMove(moveString) {
  if (!game) {
    console.log("Game not started.");
    return "Start a game first by typing 'start chess'.";
  }

  // chess.js expects moves like {from: 'e2', to: 'e4'}
  if (moveString.length !== 4) {
    return "Invalid move format. Use format like 'e2e4'.";
  }

  const move = game.move({
    from: moveString.slice(0, 2),
    to: moveString.slice(2, 4),
    promotion: 'q' // always promote to queen
  });

  if (move === null) {
    return "Illegal move. Try again.";
  }

  board.position(game.fen());
  updateStatus();

  if (game.game_over()) {
    return "Game over. " + (game.in_checkmate() ? "Checkmate!" : "Draw!");
  }

  return "Move accepted: " + move.san;
}

// Expose functions to global so your main script.js can call them
window.resetChessGame = resetChessGame;
window.startChessBoard = startChessBoard;
window.userMove = userMove;
