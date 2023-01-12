require('dotenv').config();
const io = require('socket.io');
const app = new io.Server(process.env.PORT);
const Game = require('./service/game.service');

let _players = {};
let _playersInQueue = [];
let _playersInGame = []; //list of ongoing games with properties describing: {player 1, player 2, board, playerToMove};   

app.on('connect', (socket) => {
	console.log(`a client connected :: ${socket.id}`);
	
	socket.on('disconnect', () => {	
		const player = socket.id;
  		console.log(`a client disconnected :: ${player}`);
  		deletePlayerFromList(_players, player);
  		/**
		 * In case that the player disconnected is in the middle of the game.
  		 * I need to notify the player's opponent about the disconnection and stop & delete the game.
  		**/
  		if(isPlayerInGame(player)) {
  			const game = findGameByPlayerID(player);
  			deleteGameByPlayerID(_playersInGame, player);
  			app.emit('opponent_disconnected', game);
  		}
  	});

  	socket.on('setnickname', (name) => {
  		try {
  			addPlayerInList(_players, socket.id, name);
  			socket.emit('welcome', `welcome, ${name}`);
  			socket.emit('option');
  		} catch(e) {
  			console.log(e.message);
  			socket.on('error', 'server error.') 
  		}
  	});

  	socket.on('end', () => {
  		try {
  			const player = socket.id;
  			const game = findGameByPlayerID(player);
  			deleteGameByPlayerID(_playersInGame, player);
  			console.log(_playersInGame);
  			socket.emit('option');
  		} catch(e) {
  			socket.on('error', `\nserver error: ${e.message}\n`);
  		}
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
  		try {
  			const playerInMove = game.playerToMove;

  			if((move < 1 || move > 6) || isNaN(move))
  				throw new Error('invalid move. try again.');

  			const playerMoveResult = dropPlayerMove(game, move);
  			
  			if(playerMoveResult == -1)
  				throw new Error('invalid move. try again.');

  			const isWin = analyzeBoard(playerMoveResult.newboard, playerMoveResult.droppos, playerInMove); 
  			if(isWin) {
				deleteGameByPlayerID(_playersInGame, player);
				app.emit('win', game);
			} else {
				game.board = playerMoveResult.newboard;
				game.playerToMove = (playerInMove == 1)? 0 : 1;
				
				if(isDraw(game.board)) {
  					app.emit('draw', game);
  					return;
  				}

				updateGameByPlayerID(_playersInGame, player, game);
				app.emit('turn', game);
			}	
  		} catch(e) {
  			socket.emit('error', `\n${e.message}\n`);
  			socket.emit('turn', game);	
  		}
  	});
});


function isDraw(board) {
	return Game.isBoardFull(board);
}

function analyzeBoard(newBoard, lastPositionInserted, playerInMove) {
	return Game.analyze(newBoard, lastPositionInserted, playerInMove);
}

function dropPlayerMove(game, move) {
	const playerInMove = game.playerToMove;
	const columnToDrop = move-1;
	return Game.move(game.board, columnToDrop, playerInMove);
}

function addPlayerInQueue(list, player) {
	list.push(player);
}

function deletePlayerInQueue(list, player) {
	list.splice(list.indexOf(player), 1);
}

function findPossibleOpponentFor(player) {
	let opponent = null;
	while(opponent == null || opponent == player) {
		if(_playersInQueue.length > 1) opponent = _playersInQueue[Math.floor(Math.random() * _playersInQueue.length)];
		else break;
	}
	return opponent;
}

function addPlayerInList(list, id, name) {
	list[id] = name; 
}

function deletePlayerFromList(list, player) {
	delete list[player];
}

function isPlayerInGame(player) {
	for(i=0; i<_playersInGame.length; i++) {
		const playerI = _playersInGame[i].playerI;
		const playerII = _playersInGame[i].playerII;
		if(playerI == player || playerII == player)
			return true;
	}
	return false;
}

function findGameByPlayerID(player) {
	for(i=0; i<_playersInGame.length; i++) {
		const playerI = _playersInGame[i].playerI;
		const playerII = _playersInGame[i].playerII;
		if(playerI == player || playerII == player)
			return _playersInGame[i];
	}
	return false;
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
	const initial = {
		'playerI': player, 
		'playerII': opponent, 
		'board': board, 
		'playerToMove': playerToMove
	};

	list.push(initial);
}

function updateGameByPlayerID(list, player, game) {
	for(i=0;i<list.length;i++) {
		const playerI = list[i].playerI;
		const playerII = list[i].playerII;
		if(player == playerI || player == playerII) {
			list[i] = game;
			return;
		}		
	}
}

function deleteGameByPlayerID(list, player) {
	for(i=0; i<list.length; i++) {
		const playerI = _playersInGame[i].playerI;
		const playerII = _playersInGame[i].playerII;
		if(playerI == player || playerII == player)
			list.splice(i, 1);
	}
}
