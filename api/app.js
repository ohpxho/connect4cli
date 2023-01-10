require('dotenv').config();
const io = require('socket.io');
const app = new io.Server(process.env.PORT);
const Game = require('./service/game.service');

let _players = {};
let _playersInQueue = [];
let _playersInGame = []; //list of ongoing games with elements describing: [player 1, player 2, board, playerToMove];   

app.on('connect', (socket) => {
	console.log(`a client connected :: ${socket.id}`);
	
	socket.on('disconnect', () => {	
		const player = socket.id;
  		console.log(`a client disconnected :: ${player}`);
  		deletePlayerFromList(_players, player);
  		//In case that the player disconnected is in the middle of the game.
  		//I need to notify the player's opponent about the disconnection and stop the game.
  		if(isPlayerInGame(player)) {
  			const game = findGameByPlayerID(player);
  			deleteGameByPlayerID(_playersInGame, player);
  			app.emit('opponent_disconnected', game);
  		}
  	});

  	socket.on('setnickname', (name) => {
  		addPlayerInList(_players, socket.id, name);
  		socket.emit('welcome', `welcome, ${name}`);
  		socket.emit('option');
  	});

  	socket.on('end', () => {
  		socket.emit('option');
  	});


  	socket.on('start', () => {
  		const player = socket.id;
  		addPlayerInQueue(_playersInQueue, player);
  		const opponent = findPossibleOpponentFor(player);
		if(opponent != null) {
			deletePlayerInQueue(_playersInQueue, opponent);
			deletePlayerInQueue(_playersInQueue, player);
			addNewGame(_playersInGame, player, opponent);
			const game = findGameByPlayerID(player);
			app.emit('matchFound', [player, opponent]);
			app.emit('turn', game);
		}
	});

  	socket.on('turn', (move) => {
  		const player = socket.id;
  		let game = findGameByPlayerID(player);
  		const playerI = game[0];
  		const playerII = game[1];
  		let board = game[2];
  		const playerInMove = game[3];
  		//The board has only 6 columns. The move should be at close interval of number of columns
  		if(move >= 1 && move <= 6) {
  			const playerMoveResult = dropPlayerMove(game, move);
  			const isWin = analyzeBoard(playerMoveResult.newboard, playerMoveResult.droppos, playerInMove); 
  			board = playerMoveResult.newboard;
			if(isWin) {
				deleteGameByPlayerID(_playersInGame, player);
				app.emit('win', game);
			} else {
				const playerToMove = (playerInMove == 1)? 0 : 1;
				game = [playerI, playerII, board, playerToMove];
				updateGameByPlayerID(_playersInGame, player, game);
				app.emit('turn', game);
			}	
  		} else {
  			socket.emit('turn', game, '\ninvalid move. try again.\n');	
  		}
  	});


});

function analyzeBoard(newBoard, lastPositionInserted, playerInMove) {
	return Game.analyze(newBoard, lastPositionInserted, playerInMove);
}

function dropPlayerMove(game, move) {
	const board = game[2];
	const playerInMove = game[3];
	const columnToDrop = move-1;
	return Game.move(board, columnToDrop, playerInMove);
}

function addNewGame(list, player, opponent) {
	const playerToMove = Math.floor(Math.random() * 2);
	const board = [
		[-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1]
	];
	const initial = [player, opponent, board, playerToMove];
	list.push(initial);
}

function findPossibleOpponentFor(player) {
	let opponent = null;
	while(opponent == null || opponent == player) {
		if(_playersInQueue.length > 1) opponent = _playersInQueue[Math.floor(Math.random() * _playersInQueue.length)];
		else break;
	}
	return opponent;
}

function addPlayerInQueue(list, player) {
	list.push(player);
}

function deletePlayerInQueue(list, player) {
	list.splice(list.indexOf(player), 1);
}

function addPlayerInList(list, id, name) {
	list[id] = name; 
}

function deletePlayerFromList(list, player) {
	delete list[player];
}

function isPlayerInGame(player) {
	for(i=0; i<_playersInGame.length; i++) {
		const playerI = _playersInGame[i][0];
		const playerII = _playersInGame[i][1];
		if(playerI == player || playerII == player) {
			return true;
		}
	}
	return false;
}

function findGameByPlayerID(player) {
	for(i=0; i<_playersInGame.length; i++) {
		const playerI = _playersInGame[i][0];
		const playerII = _playersInGame[i][1];
		if(playerI == player || playerII == player) {
			return _playersInGame[i];
		}
	}
	return false;
}

function deleteGameByPlayerID(list, player) {
	for(i=0; i<list.length; i++) {
		const playerI = _playersInGame[i][0];
		const playerII = _playersInGame[i][1];
		if(playerI == player || playerII == player) {
			list.splice(i, 1);
		}
	}
}

function updateGameByPlayerID(list, player, game) {
	for(i=0;i<list.length;i++) {
		const playerI = list[i][0];
		const playerII = list[i][1];
		if(player == playerI || player == playerII) {
			list[i] = game;
			return;
		}		
	}
}