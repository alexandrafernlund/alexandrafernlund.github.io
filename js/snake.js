document.addEventListener('DOMContentLoaded', () => {
    const snakeGame = document.getElementById('snake-game');
    const terminalInput = document.getElementById('userInput');

    if (!snakeGame || !terminalInput) {
        alert('Missing required elements: #snake-game or #userInput.');
        return;
    }

    const width = 20;
    const height = 10;

    let snake = [];
    let food = {};
    let direction = { x: 1, y: 0 };
    let gameOver = false;
    let gameInterval = null;
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

                if (snake.some(s => s.x === x && s.y === y)) {
                    cell.style.backgroundColor = 'green';
                    cell.style.borderRadius = '4px';
                } else if (food.x === x && food.y === y) {
                    cell.style.backgroundColor = 'red';
                    cell.style.borderRadius = '50%';
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
                y: Math.floor(Math.random() * height),
            };
        } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
        food = newFood;
    }

    function moveSnake() {
        if (gameOver) return;

        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (
            newHead.x < 0 || newHead.x >= width ||
            newHead.y < 0 || newHead.y >= height ||
            snake.some(s => s.x === newHead.x && s.y === newHead.y)
        ) {
            endGame();
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

    function handleKey(e) {
        if (!window.gameActive || gameOver) return;

        switch (e.key) {
            case 'ArrowUp':
                if (direction.y === 1) break;
                direction = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (direction.y === -1) break;
                direction = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (direction.x === 1) break;
                direction = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (direction.x === -1) break;
                direction = { x: 1, y: 0 };
                break;
        }
    }

    window.startGame = function () {
        snake = [
            { x: 10, y: 5 },
            { x: 9, y: 5 },
            { x: 8, y: 5 }
        ];
        direction = { x: 1, y: 0 };
        gameOver = false;
        window.gameActive = true;
        placeFood();
        draw();
        snakeGame.style.display = 'grid';
        terminalInput.disabled = true;
        document.addEventListener('keydown', handleKey);
        gameInterval = setInterval(moveSnake, 150);
    };

    window.endGame = function () {
        gameOver = true;
        clearInterval(gameInterval);
        window.gameActive = false;
        snakeGame.style.display = 'none';
        terminalInput.disabled = false;
        document.removeEventListener('keydown', handleKey);
        alert('Game Over! Type "play snake" to try again.');
    };
});
