const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let gameSpeed = 200; // Velocidad inicial del juego (en ms)
let foodTimeoutId; // ID del temporizador para la comida
let level = 1; // Nivel inicial
let pointsToNextLevel = 10; // Puntos necesarios para pasar al siguiente nivel
let directionQueue = []; // Cola para almacenar los movimientos pendientes
let obstacles = []; // Array para almacenar las posiciones de los obstáculos

// Getting high score from the local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// Cargar Sonidos
const sonidoFondo = new Audio("vibora.mp3");
sonidoFondo.loop = true;
sonidoFondo.volume = 0.2;

// Reproducir sonido al primer evento del usuario
const iniciarMusicaFondo = () => {
    sonidoFondo.play().catch(e => {
        // En caso de error por autoplay, se ignora
        console.warn("Autoplay bloqueado hasta que el usuario interactúe.");
    });
    // Esto se ejecuta una sola vez
    document.removeEventListener("keydown", iniciarMusicaFondo);
    document.removeEventListener("click", iniciarMusicaFondo);
};

// Esperar una interacción para iniciar el sonido
document.addEventListener("keydown", iniciarMusicaFondo);
document.addEventListener("click", iniciarMusicaFondo);

const updateFoodPosition = () => {
    // Generar una nueva posición para la comida
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;

    // Reiniciar el temporizador para que la comida desaparezca
    clearTimeout(foodTimeoutId);
    foodTimeoutId = setTimeout(() => {
        updateFoodPosition(); // Cambiar la posición de la comida si no se consume
    }, 7000); // La comida desaparece después de 5 segundos
}

const handleGameOver = () => {
    // Detener la música de fondo
    sonidoFondo.pause();
    sonidoFondo.currentTime = 0; // Reiniciar la música al inicio

    // Detener el temporizador y recargar la página
    clearInterval(setIntervalId);
    alert("Game Over! Press OK to replay...");
    location.reload();
};

const changeDirection = e => {
    // Agregar la dirección a la cola si no es opuesta a la actual
    if (e.key === "ArrowUp" && velocityY !== 1) {
        directionQueue.push({ x: 0, y: -1 });
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        directionQueue.push({ x: 0, y: 1 });
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        directionQueue.push({ x: -1, y: 0 });
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        directionQueue.push({ x: 1, y: 0 });
    }
};

const applyDirection = () => {
    // Aplicar la siguiente dirección de la cola si existe
    if (directionQueue.length > 0) {
        const nextDirection = directionQueue.shift();
        velocityX = nextDirection.x;
        velocityY = nextDirection.y;
    }
};

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const increaseSpeed = () => {
    // Incrementar la velocidad del juego
    gameSpeed = Math.max(50, gameSpeed - 10); // Reducir el intervalo, mínimo 50ms
    clearInterval(setIntervalId);
    setIntervalId = setInterval(initGame, gameSpeed);
}

/*
const resetGameForNextLevel = () => {
    // Incrementar el tamaño del mapa
    const newGridSize = 30 + level * 5; // Incrementar el tamaño en 5 celdas por nivel
    document.documentElement.style.setProperty('--grid-size', newGridSize);

    // Reiniciar la posición de la serpiente y la comida
    snakeX = Math.floor(newGridSize / 2);
    snakeY = Math.floor(newGridSize / 2);
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    updateFoodPosition();

    // Incrementar el nivel y ajustar la dificultad
    level++;
    pointsToNextLevel += 3; // Incrementar los puntos necesarios para el siguiente nivel
    score = 0; // Reiniciar el puntaje
    scoreElement.innerText = `Score: ${score}`; // Actualizar el puntaje en pantalla

    // Reiniciar la velocidad base y sumarle 10ms por nivel
    gameSpeed = 200 - (level * 10); // Velocidad inicial menos 10ms por nivel
    gameSpeed = Math.max(50, gameSpeed); // Asegurarse de que no sea menor a 50ms
    clearInterval(setIntervalId);
    setIntervalId = setInterval(initGame, gameSpeed);

    alert(`¡Nivel ${level}! Ahora necesitas ${pointsToNextLevel} puntos para pasar al siguiente nivel.`);
};
*/

/*
const generateObstacles = () => {
    obstacles = [];
    const obstacleCount = level * 3; // Incrementar el número de obstáculos por nivel
    for (let i = 0; i < obstacleCount; i++) {
        const obstacleX = Math.floor(Math.random() * 30) + 1;
        const obstacleY = Math.floor(Math.random() * 30) + 1;

        // Evitar que los obstáculos aparezcan en la posición inicial de la serpiente o la comida
        if ((obstacleX === snakeX && obstacleY === snakeY) || (obstacleX === foodX && obstacleY === foodY)) {
            i--; // Reintentar si la posición está ocupada
            continue;
        }

        obstacles.push({ x: obstacleX, y: obstacleY });
    }
};
*/

const initGame = () => {
    if (gameOver) return handleGameOver();

    applyDirection(); // Aplicar el siguiente movimiento de la cola

    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // Generar los obstáculos
    obstacles.forEach(obstacle => {
        html += `<div class="obstacle" style="grid-area: ${obstacle.y} / ${obstacle.x}"></div>`;
    });

    // Comprobar si la serpiente come la comida
    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // Agregar un segmento al cuerpo de la serpiente
        score++; // Incrementar la puntuación
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
        increaseSpeed(); // Incrementar la velocidad del juego

        // Verificar si se alcanzaron los puntos necesarios para pasar de nivel
        if (score >= pointsToNextLevel) {
            generateObstacles(); // Generar nuevos obstáculos
            resetGameForNextLevel();
        }
    }

    // Actualizar la posición de la cabeza de la serpiente
    snakeX += velocityX;
    snakeY += velocityY;

    // Comprobar si la serpiente choca con un obstáculo
    if (obstacles.some(obstacle => obstacle.x === snakeX && obstacle.y === snakeY)) {
        gameOver = true;
    }

    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position

    // Checking if the snake's head is out of wall, if so setting gameOver to true
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        // Determinar la clase según la posición del bloque
        let partClass = "torso";
        let rotation = 0; // Rotación predeterminada

        if (i === 0) {
            partClass = "head"; // La cabeza
            if (velocityX === 1) rotation = 90; // Derecha
            else if (velocityX === -1) rotation = -90; // Izquierda
            else if (velocityY === 1) rotation = 180; // Abajo
        } else if (i === snakeBody.length - 1) {
            partClass = "tail"; // La cola
            const [prevX, prevY] = snakeBody[i - 1];
            if (prevX > snakeBody[i][0]) rotation = 90; // Derecha
            else if (prevX < snakeBody[i][0]) rotation = -90; // Izquierda
            else if (prevY > snakeBody[i][1]) rotation = 180; // Abajo
        } else {
            // Torso: calcular la dirección basándose en los segmentos anterior y posterior
            const [prevX, prevY] = snakeBody[i - 1];
            const [nextX, nextY] = snakeBody[i + 1];

            if (prevX < nextX) rotation = 90; // Derecha
            else if (prevX > nextX) rotation = -90; // Izquierda
            else if (prevY < nextY) rotation = 0; // Arriba
            else if (prevY > nextY) rotation = 180; // Abajo
        }

        // Agregar un div para cada parte de la serpiente
        html += `<div class="${partClass}" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}; transform: rotate(${rotation}deg);"></div>`;

        // Comprobar si la cabeza choca con el cuerpo
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = html;
};

updateFoodPosition();
generateObstacles();
setIntervalId = setInterval(initGame, gameSpeed);
document.addEventListener("keyup", changeDirection);
