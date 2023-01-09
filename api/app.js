require('dotenv').config();
const io = require('socket.io');
const app = new io.Server(3000);
const game = require('./service/game.service');

let _players = {};
let _playersInQueue = [];
let _playersInGame = [];


app.on('connect', (socket) => {
	//log connected player's id 
	console.log(`a client connected :: ${socket.id}`);
	
	//player disconnected
	socket.on('disconnect', () => {	
		const player = socket.id;
  		console.log(`a client disconnected :: ${player}`);
  		deletePlayerFromList(player);
  		if(isPlayerInGame(player)) {
  			const game = findGameByPlayerID(player);
  			if(!deleteGameByPlayerID(player)) console.log('Failed to delete the game.');
  			app.emit('opponent_disconnected', game);
  		}
  	});

	//player set his/her nickname
  	socket.on('setnickname', (name) => {
  		addPlayerFromList(socket.id, name);
  		socket.emit('welcome', `welcome, ${name}`);
  		socket.emit('option');
  	});

  	//game done/end/stop
  	socket.on('end', () => {
  		socket.emit('option');
  	});


  	socket.on('start', () => {
  		const player = socket.id;
  		addPlayerInQueue(player);
		const opponent = findPossibleOpponentFor(player);
		if(opponent != null) {
			deletePlayerInQueue(opponent);
			deletePlayerInQueue(player);
			addNewGame(player, opponent);
			const game = findGameByPlayerID(player);
			app.emit('matchFound', [player, opponent]);
			app.emit('turn', game);
		}
	});

  	socket.on('turn', (move) => {
  		let state = findGameByPlayerID(socket.id);
  		if(move < 0 || move > 6) {
  			socket.emit('turn', state, '\nopponent disconnected\n');
  		} else {
  			const dropMove = game.move(state[2], move-1, state[3]);
  			const isWin = game.analyze(dropMove.newboard, dropMove.droppos, state[3]); 
  			state[2] = dropMove.newboard;
			if(isWin) {
				deleteGameByPlayerID(socket.id);
				app.emit('win', state);
			} else {
				state[3] = (state[3] == 1)? 0 : 1;
				_playersInGame[_playersInGame.indexOf(socket.id)] = state;
				app.emit('turn', findGameByPlayerID(socket.id));
			}		
  		}
  	});

  	socket.on('surrender', () => {});
});

//*** FUNCTIONS ***//

function addNewGame(player, opponent) {
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
	_playersInGame.push(initial);
}

function findPossibleOpponentFor(player) {
	let opponent = null;
	while(opponent == null || opponent == player) {
		if(_playersInQueue.length > 1) opponent = _playersInQueue[Math.floor(Math.random() * _playersInQueue.length)];
		else break;
	}
	return opponent;
}

function addPlayerInQueue(player) {
	_playersInQueue.push(player);
}

function deletePlayerInQueue(player) {
	_playersInQueue.splice(_playersInQueue.indexOf(player), 1);
}

function addPlayerFromList(id, name) {
	_players[id] = name; 
}

function deletePlayerFromList(player) {
	delete _players[player];
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

function deleteGameByPlayerID(player) {
	for(i=0; i<_playersInGame.length; i++) {
		const playerI = _playersInGame[i][0];
		const playerII = _playersInGame[i][1];
		if(playerI == player || playerII == player) {
			_playersInGame.splice(i, 1)
			return true;
		}
	}
	return false;
}