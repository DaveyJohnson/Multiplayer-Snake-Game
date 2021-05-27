const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity
}

function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x: 3,
                y: 10,
            },
            velocity: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10},
            ],
        },
        {
            pos: {
                x: 18,
                y: 10,
            },
            velocity: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 20, y: 10},
                {x: 19, y: 10},
                {x: 18, y: 10},
            ],
        }],
        food: {},
        gridsize: GRID_SIZE,
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.velocity.x;
    playerOne.pos.y += playerOne.velocity.y;

    playerTwo.pos.x += playerTwo.velocity.x;
    playerTwo.pos.y += playerTwo.velocity.y;

    // check that player 1 has not traveled off the game grid.
    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2;  // playerOne loses
    }

    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        return 1;  // playerTwo loses
    }

    // check if player 1 has eaten food; if yes grow body of the snake by one
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.velocity.x;
        playerOne.pos.y += playerOne.velocity.y;
        randomFood(state);
    }

    // check if player 2 has eaten food; if yes grow body of the snake by one
    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.velocity.x;
        playerTwo.pos.y += playerTwo.velocity.y;
        randomFood(state);
    }

    // check that player 1 is moving
    if (playerOne.velocity.x || playerOne.velocity.y) {
        // check that snake has not bumped into itself
        for (let cell of playerOne.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2; //playerOne loses
            }
        }

        playerOne.snake.push({ ...playerOne.pos });
        playerOne.snake.shift();
    }

        // check that the player 2 is moving
        if (playerTwo.velocity.x || playerTwo.velocity.y) {
            // check that snake has not bumped into itself
            for (let cell of playerTwo.snake) {
                if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                    return 1; //playerTwo loses
                }
            }
    
            playerTwo.snake.push({ ...playerTwo.pos });
            playerTwo.snake.shift();
        }

    return false;

}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }
    // check that food isn't part of player 1's snake
    for (let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            // food is on top of snake; make recursive call to randomFood until food is placed on empty square
            return randomFood(state);
        }
    }

    // check that food isn't part of player 2's snake
    for (let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            // food is on top of snake; make recursive call to randomFood until food is placed on empty square
            return randomFood(state);
        }
    }
    
    state.food = food;
}

function getUpdatedVelocity(keyCode) {
    switch (keyCode) {
        case 37: { //left
            return { x: -1, y: 0 };
        }
        case 38: { //down
            return { x: 0, y: -1 };
        } 
        case 39: { //right
            return { x: 1, y: 0 };
        } 
        case 40: { //up
            return { x: 0, y: 1 };
        }   
    }
}