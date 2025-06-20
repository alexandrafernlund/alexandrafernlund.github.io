document.addEventListener('DOMContentLoaded', () => {
    const snakeGame = document.getElementById('snake-game');
    const terminalInput = document.getElementById('userInput');
    const terminal = document.querySelector('.terminal');

    if (!snakeGame || !terminalInput || !terminal) {
        console.error('Required elements not found.');
        return;
    }

    let width; // will be dynamically set
    const height = 10;
    let snake = [];
    let food = {};
    let direction = { x: 1, y: 0 };
    let gameInterval;
    let gameOver = false;

    window.gameActive = false;

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
            endGame("You win! No space left for food.");
            return;
        }
        const chosen = validCells[Math.floor(Math.random() * validCells.length)];
        food = chosen;
        console.log("✅ Placed food at", food);
    }

    function draw() {
        if (!snakeGame) return;
        snakeGame.innerHTML = '';

        if (!food || food.x < 0 || food.x >= width || food.y < 0 || food.y >= height) {
            console.warn("⚠️ Food out of bounds, repositioning...");
            placeFood();
        }

        let foodDrawn = false;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = document.createElement('div');
                cell.classList.add('snake-cell');

                if (snake.some(part => part.x === x && part.y === y)) {
                    cell.classList.add('snake-part');
                } else if (food.x === x && food.y === y) {
                    cell.classList.add('snake-food');
                    foodDrawn = true;
                }

                snakeGame.appendChild(cell);
            }
        }

        if (!foodDrawn) {
            console.warn("⚠️ Food was not drawn!", food);
        }
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
        const cellSize = 20;
        width = Math.floor(terminal.clientWidth / cellSize);
        console.log("🟢 Grid size set to:", width, height);

        snake = [
            { x: Math.floor(width / 2), y: Math.floor(height / 2) },
            { x: Math.floor(width / 2) - 1, y: Math.floor(height / 2) },
            { x: Math.floor(width / 2) - 2, y: Math.floor(height / 2) }
        ];

        direction = { x: 1, y: 0 };
        gameOver = false;
        window.gameActive = true;
        terminalInput.disabled = true;

        snakeGame.style.display = 'grid';
        snakeGame.style.gridTemplateColumns = `repeat(${width}, ${cellSize}px)`;
        snakeGame.style.gridTemplateRows = `repeat(${height}, ${cellSize}px)`;
        snakeGame.style.padding = '10px';
        snakeGame.style.height = 'auto';

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

        if (
            newHead.x < 0 || newHead.x >= width ||
            newHead.y < 0 || newHead.y >= height ||
            snake.some(part => part.x === newHead.x && part.y === newHead.y)
        ) {
            endGame("Game Over. Type 'play snake' to try again.");
            return;
        }

        snake.unshift(newHead);

        if (newHead.x === food.x && newHead.y === food.y) {
            placeFood();
        } else {
            snake.pop();
        }

        draw();
    }

    window.endGame = function () {
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
