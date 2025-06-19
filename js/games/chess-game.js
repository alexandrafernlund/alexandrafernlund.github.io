let board = null;
let game = null;
let engine = null;
let boardInitialized = false;

function initChessBoard() {
  if (boardInitialized) return;

  board = Chessboard('board', {
    position: 'start',
    draggable: true,
    onDrop: onDrop
  });

  game = new Chess();
  engine = typeof STOCKFISH === "function" ? STOCKFISH() : null;

  if (!engine) {
    console.error("Stockfish failed to load.");
    return;
  }

  engine.onmessage = function (event) {
    console.log("Engine:", event.data);
    const match = event.data.match(/^bestmove\s(\w{4,5})/);
    if (match) {
      const move = match[1];
      game.move({
        from: move.substring(0, 2),
        to: move.substring(2, 4),
        promotion: move.length === 5 ? move[4] : 'q'
      });
      board.position(game.fen());
    }
  };

  engine.postMessage("uci");
  boardInitialized = true;
}

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  board.position(game.fen());
  setTimeout(makeEngineMove, 250);
}

function makeEngineMove() {
  engine.postMessage(`position fen ${game.fen()}`);
  engine.postMessage("go depth 12");
}

window.toggleChess = function () {
  const container = document.getElementById("chess-container");
  const nowHidden = container.style.display === "none";
  container.style.display = nowHidden ? "block" : "none";

  if (nowHidden) initChessBoard();
};

window.resetChessGame = function () {
  if (!game || !board) return;
  game.reset();
  board.start();
};
