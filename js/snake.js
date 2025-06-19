document.addEventListener('DOMContentLoaded', () => {
    const snakeGame = document.getElementById('snake-game');
    const terminalInput = document.getElementById('userInput');

    if (!snakeGame || !terminalInput) {
        console.error('snakeGame or terminalInput not found.');
        return;
    }

    const width = 20;
    const height = 10;
    let snake = [];
    let food = {};
    let direction = { x: 1, y: 0 };
    let gameInterval;
    let gameOver = false;

    window.gameActive = false;

    function draw() {
        if (!snakeGame) return;
        snakeGame.innerHTML = '';

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = document.createElement('div');
                cell.style.width = '20px';
                cell.style.height = '20px';
                cell.style.backgroundColor = '#222';

                if (snake.some(part => part.x === x && part.y === y)) {
                    cell.style.backgroundColor = 'limegreen';
                } else if (food.x === x && food.y === y) {
                    cell.style.backgroundColor = 'red';
                }

                snakeGame.appendChild(cell);
            }
        }
    }

    function placeFood() {
        food = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height)
        };
        console.log('Placed food at', food);
    }

    function handleKey(e) {
    e.preventDefault(); // prevent page from scrolling with arrow keys

    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) direction = { x: 1, y: 0 };
            break;
    }
}

    window.startGame = function () {
    console.log("Starting Snake Game");

    // Reset
    clearInterval(gameInterval);
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    direction = { x: 1, y: 0 };
    gameOver = false;
    window.gameActive = true;
    terminalInput.disabled = true;

    // Set grid explicitly now
    snakeGame.style.display = 'grid';
    snakeGame.style.gridTemplateColumns = `repeat(${width}, 20px)`;
    snakeGame.style.gridTemplateRows = `repeat(${height}, 20px)`;

    placeFood();
    draw(); // draw AFTER food and snake are ready

    document.removeEventListener('keydown', handleKey); // avoid multiple bindings
    document.addEventListener('keydown', handleKey);
    gameInterval = setInterval(moveSnake, 200);
};

function moveSnake() {
    if (gameOver || !snake.length) return;

    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Check wall or self collision
    const hitsWall = newHead.x < 0 || newHead.x >= width || newHead.y < 0 || newHead.y >= height;
    const hitsSelf = snake.some(part => part.x === newHead.x && part.y === newHead.y);

    if (hitsWall || hitsSelf) {
        console.log("Collision detected. Wall:", hitsWall, "Self:", hitsSelf);
        endGame();
        return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        placeFood(); // eat and grow
    } else {
        snake.pop(); // move forward
    }

    draw();
}


    window.endGame = function () {
        console.log("Game Over");
        clearInterval(gameInterval);
        gameOver = true;
        window.gameActive = false;
        terminalInput.disabled = false;
        snakeGame.style.display = 'none';
        alert("Game Over. Type 'play snake' to try again.");
        document.removeEventListener('keydown', handleKey);
    };
});
