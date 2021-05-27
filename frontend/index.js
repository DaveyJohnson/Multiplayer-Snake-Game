const BG_COLOR = '#7f7f7f';
const SNAKE_COLOR = '#231f20';
const SNAKE2_COLOR = 'red';
const FOOD_COLOR = '#e66916';

const socket = io('http://127.0.0.1:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('roomFull', handleRoomFull);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, context;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.getElementById('canvas');
    context = canvas.getContext ('2d');

    canvas.width = canvas.height = 600;

    context.fillStyle = BG_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);

    gameActive = true;
}

function keydown(event) {
    socket.emit('keydown', event.keyCode);
}

function paintGame(state) {
    context.fillStyle = BG_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    context.fillStyle = FOOD_COLOR;
    context.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_COLOR);
    paintPlayer(state.players[1], size, SNAKE2_COLOR);

}

function paintPlayer(playerState, size, color) {
    const snake = playerState.snake;
    context.fillStyle = color;
    snake.forEach(cell => {
        context.fillRect(cell.x * size, cell.y * size, size, size);
    })
    
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }

    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }

    data = JSON.parse(data);

    if (data.winner === playerNumber) {
        alert("You win!");
    } else {
        alert("You lose.");
    }

    gameActive = false;
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    alert("Unknown game code");
}

function handleRoomFull() {
    reset();
    alert("This game is already in progress");
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}