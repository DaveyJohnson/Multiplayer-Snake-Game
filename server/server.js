const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeId } = require('./utils');

const state = {};
const clientRooms = {};

io.on('connection', client => {
    
    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(gameCode) {
        const room = io.sockets.adapter.rooms[gameCode];

        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) {
            client.emit('roomFull');
            return;
        }

        clientRooms[client.id] = gameCode;
        client.emit('gameCode', gameCode);

        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(gameCode);
    }

    function handleNewGame() {
        let roomName = makeId(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode)
        } catch (e) {
            console.error(e);
            return;
        }

        const velocity = getUpdatedVelocity(keyCode);

        if(velocity) {
            state[roomName].players[client.number - 1].velocity = velocity;
        }
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if (!winner) {
            emitGameState(roomName, state[roomName])
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE); 
}

function emitGameState(roomName, state) {
    io.sockets.in(roomName)
        .emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName)
        .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
