document.addEventListener('DOMContentLoaded', () => {
    const snakeGame = document.getElementById('snake-game');
    const terminalInput = document.getElementById('userInput');
    const terminal = document.querySelector('.terminal');

    if (!snakeGame || !terminalInput || !terminal) {
        console.error('Required elements not found.');
        return;
    }

    let width = 10; // Fixed for debugging!
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

        let foodDrawn = false;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = document.createElement('div');
                cell.classList.add('snake-cell');

                if (snake.some(part => part.x === x && part.y === y)) {
                    cell.classList.add('snake-part');
                } else if (
                    food &&
                    Number.isInteger(food.x) &&
                    Number.isInteger(food.y) &&
                    food.x === x &&
                    food.y === y
                ) {
                    cell.classList.add('snake-food');
                    foodDrawn = true;
                }

                snakeGame.appendChild(cell);
            }
        }

        console.log(`DRAWING GRID: width=${width}, height=${height}, food=(${food?.x}, ${food?.y})`);

        if (food && (food.x >= width || food.y >= height)) {
            console.error("❌ Food outside bounds in draw():", food, width, height);
        }

        if (!foodDrawn) {
            console.warn("⚠️ Food was not drawn!", food, snake);
        }
    }

    function placeFood() {
        const validCells = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!snake.some(segment => segment.x === x && segment.y === y)) {
                    validCells.push({ x, y });
                }
            }
        }

        if (validCells.length === 0) {
            console.warn("No space left for food. You win!");
            endGame("You win! No space left for food.");
            return;
        }

        const chosen = validCells[Math.floor(Math.random() * validCells.length)];

        if (
            !chosen ||
            typeof chosen.x !== 'number' ||
            typeof chosen.y !== 'number' ||
            chosen.x >= width ||
            chosen.y >= height
        ) {
            console.error("❌ Invalid food placement:", chosen, "Grid:", width, height);
            return;
        }

        food = chosen;
        console.log("✅ Placed food at", food);
    }

    function handleKey(e) {
        e.preventDefault();

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
        const cellSize = 20; // Width of one cell in pixels
        const gapSize = 2;   // Match the gap in your CSS

        // 1. Force snakeGame to be shown so dimensions are accurate
        snakeGame.style.display = 'grid';
        snakeGame.style.padding = '10px';
        snakeGame.style.height = 'auto';

        // 2. Calculate terminal width and derive number of cells that fit
        const terminalWidth = terminal.clientWidth;
        width = Math.floor((terminalWidth + gapSize) / (cellSize + gapSize));
        const totalGridWidth = width * (cellSize + gapSize) - gapSize;

        // 3. Set styles based on calculated width
        snakeGame.style.gridTemplateColumns = `repeat(${width}, ${cellSize}px)`;
        snakeGame.style.gridTemplateRows = `repeat(${height}, ${cellSize}px)`;
        snakeGame.style.width = `${totalGridWidth}px`; // Set actual width to match exact columns

        console.log("🟢 Grid width:", width, "px:", totalGridWidth);

        // 4. Initialize snake
        snake = [
            { x: Math.floor(width / 2), y: Math.floor(height / 2) },
            { x: Math.floor(width / 2) - 1, y: Math.floor(height / 2) },
            { x: Math.floor(width / 2) - 2, y: Math.floor(height / 2) }
        ];

        direction = { x: 1, y: 0 };
        gameOver = false;
        window.gameActive = true;
        terminalInput.disabled = true;

        // 5. Place food and draw grid
        placeFood();
        draw();

        document.removeEventListener('keydown', handleKey);
        document.addEventListener('keydown', handleKey);

        setTimeout(() => {
            gameInterval = setInterval(moveSnake, 200);
        }, 500);
    };


    function moveSnake() {
        if (gameOver || !snake.length) return;

        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        const hitsWall = newHead.x < 0 || newHead.x >= width || newHead.y < 0 || newHead.y >= height;
        const hitsSelf = snake.some(part => part.x === newHead.x && part.y === newHead.y);

        if (hitsWall || hitsSelf) {
            endGame("Game Over. Type 'play snake' to try again.");
            return;
        }

        snake.unshift(newHead);

        const ateFood = food && newHead.x === food.x && newHead.y === food.y;

        if (ateFood) {
            placeFood();
        } else {
            snake.pop();
        }

        draw();
    }

    window.endGame = function () {
        console.log("🔴 Game Over");
        clearInterval(gameInterval);
        gameOver = true;
        window.gameActive = false;
        terminalInput.disabled = false;
        snakeGame.style.display = 'none';
        snakeGame.innerHTML = '';
        document.removeEventListener('keydown', handleKey);

        const event = new CustomEvent('snakeGameOver', {
            detail: "Game Over. Type 'play snake' to try again."
        });
        window.dispatchEvent(event);
    };
});
