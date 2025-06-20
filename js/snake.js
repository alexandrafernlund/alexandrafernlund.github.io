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
                cell.classList.add('snake-cell');

                if (snake.some(part => part.x === x && part.y === y)) {
                    cell.classList.add('snake-part');
                } else if (food.x === x && food.y === y) {
                    cell.classList.add('snake-food');
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
        { x: 10, y: 5 },
        { x: 9, y: 5 },
        { x: 8, y: 5 }
    ];
    direction = { x: 1, y: 0 };
    gameOver = false;
    window.gameActive = true;
    terminalInput.disabled = true;

    // Set grid layout
    snakeGame.style.display = 'grid';
    snakeGame.style.gridTemplateColumns = `repeat(${width}, 20px)`;
    snakeGame.style.gridTemplateRows = `repeat(${height}, 20px)`;

    placeFood();
    draw();

    document.removeEventListener('keydown', handleKey);
    document.addEventListener('keydown', handleKey);

    // ✨ Delay first move by 500ms
    setTimeout(() => {
        gameInterval = setInterval(moveSnake, 200);
    }, 500);
};

function moveSnake() {
    if (gameOver || !snake.length) return;

    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    console.log("New head:", newHead);
    console.log("Snake:", snake);

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
        // snakeGame.style.display = 'none';
        alert("Game Over. Type 'play snake' to try again.");
        document.removeEventListener('keydown', handleKey);
    };
});
