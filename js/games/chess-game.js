let board = null;
let game = null;
let engine = null;
let boardInitialized = false;

function initChessBoard() {
  console.log('initChessBoard called');

  const boardElement = document.getElementById('board');
  if (!boardElement) {
    console.error('No #board element found in DOM.');
    return;
  }

  if (boardInitialized) return;

  board = Chessboard('board', {
    position: 'start',
    draggable: true,
    onDrop: onDrop,
    pieceTheme: 'assets/img/chesspieces/wikipedia/{piece}.png'
  });

  if (!board) {
    console.error("Chessboard failed to initialize.");
    return;
  }

  game = new Chess();
  engine = new Worker('js/games/stockfish.js');

  if (!engine) {
    console.error("Stockfish failed to load.");
    return;
  }

  engine.postMessage('uci');

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

  if (nowHidden) {
    setTimeout(() => {
      if (document.getElementById('board')) initChessBoard();
    }, 50); // Wait a moment to make sure board is in DOM
  }
};

window.resetChessGame = function () {
  if (!game || !board) return;
  game.reset();
  board.start();
};
