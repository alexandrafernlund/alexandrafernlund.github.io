window.resetChessGame = function() {
    game.reset();
    board.start();
  };

  window.toggleChess = function() {
    const container = document.getElementById("chess-container");
    container.style.display = container.style.display === "none" ? "block" : "none";
  };

document.addEventListener('DOMContentLoaded', () => {
  const board = Chessboard('board', {
    position: 'start',
    draggable: true,
    onDrop: onDrop
  });

  const game = new Chess();
  const engine = STOCKFISH();

  engine.postMessage("uci");

  function onDrop(source, target) {
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    if (move === null) return 'snapback';

    board.position(game.fen());
    window.setTimeout(makeEngineMove, 250);
  }

  function makeEngineMove() {
    engine.postMessage(`position fen ${game.fen()}`);
    engine.postMessage("go depth 12");

    engine.onmessage = function(event) {
      const match = event.data.match(/^bestmove\s(\w{4})/);
      if (match) {
        const move = match[1];
        game.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: 'q' });
        board.position(game.fen());
      }
    };
  }

});

