document.addEventListener('DOMContentLoaded', () => {
    const snakeGame = document.getElementById('snake-game');
    const terminalInput = document.getElementById('userInput');
    const terminal = document.querySelector('.terminal');

    if (!snakeGame || !terminalInput || !terminal) {
        console.error('Required elements not found.');
        return;
    }

    let width;  // will be set dynamically
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
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * width),
                y: Math.floor(Math.random() * height)
            };
        } while (snake.some(part => part.x === newFood.x && part.y === newFood.y)); // Avoid placing on snake

        food = newFood;
        console.log('Placed food at', food);
    }

    function handleKey(e) {
        e.preventDefault(); // prevent page scrolling

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

        // Calculate dynamic width based on terminal width and cell size
        const cellSize = 20; // must match your CSS cell width & height
        const terminalWidth = terminal.clientWidth;
        width = Math.floor(terminalWidth / cellSize);

        // Reset snake starting position near the middle
        snake = [
            { x: Math.floor(width / 2), y: 5 },
            { x: Math.floor(width / 2) - 1, y: 5 },
            { x: Math.floor(width / 2) - 2, y: 5 }
        ];

        direction = { x: 1, y: 0 };
        gameOver = false;
        window.gameActive = true;
        terminalInput.disabled = true;

        // Show and style the snake grid
        snakeGame.style.display = 'grid';
        snakeGame.style.gridTemplateColumns = `repeat(${width}, ${cellSize}px)`;
        snakeGame.style.gridTemplateRows = `repeat(${height}, ${cellSize}px)`;
        snakeGame.style.padding = '10px';
        snakeGame.style.height = 'auto';

        placeFood();
        draw();

        document.removeEventListener('keydown', handleKey);
        document.addEventListener('keydown', handleKey);

        // Delay first move for smooth start
        setTimeout(() => {
            gameInterval = setInterval(moveSnake, 200);
        }, 500);
    };

    function moveSnake() {
        if (gameOver || !snake.length) return;

        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Collision checks
        const hitsWall = newHead.x < 0 || newHead.x >= width || newHead.y < 0 || newHead.y >= height;
        const hitsSelf = snake.some(part => part.x === newHead.x && part.y === newHead.y);

        if (hitsWall || hitsSelf) {
            console.log("Collision detected. Wall:", hitsWall, "Self:", hitsSelf);
            endGame();
            return;
        }

        snake.unshift(newHead);

        if (newHead.x === food.x && newHead.y === food.y) {
            placeFood(); // grow
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
        snakeGame.innerHTML = '';
        document.removeEventListener('keydown', handleKey);

        // 👇 Send message to the terminal via custom event
        const event = new CustomEvent('snakeGameOver', {
            detail: "Game Over. Type 'play snake' to try again."
        });
        window.dispatchEvent(event);
    };

});
