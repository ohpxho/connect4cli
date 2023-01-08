require('dotenv').config();
const io = require('socket.io');
const app = new io.Server(3000);
const game = require('./service/game.service');

let _players = {};
let _playersInQueue = [];
let _playersInGame = [];


app.on('connect', (socket) => {
	console.log(`a client connected :: ${socket.id}`);
	socket.on('disconnect', () => {
  		console.log(`a client disconnected :: ${socket.id}`);
  	});

  	socket.on('setnickname', (name) => {
  		const id = socket.id;
  		_players[id] = name;
  		socket.emit('welcome', `welcome, ${name}`);
  		socket.emit('option');
  		console.log(_players);
  	});

  	socket.on('end', () => {
  		socket.emit('option');
  	});

  	socket.on('start', () => {
  		const player = socket.id;
  		_playersInQueue.push(player);
		let opponent = '';
		while(opponent == '' || opponent == player) {
			if(_playersInQueue.length > 1) opponent = _playersInQueue[Math.floor(Math.random() * _playersInQueue.length)];
			else break;
		}

		const opponentIndexInQueue = _playersInQueue.indexOf(opponent);
		const playerIndexInQueue = _playersInQueue.indexOf(player);
		if(playerIndexInQueue != -1 && opponentIndexInQueue != -1 && opponentIndexInQueue != playerIndexInQueue) {
			_playersInQueue.splice(opponentIndexInQueue, 1);
			if(playerIndexInQueue > opponentIndexInQueue) _playersInQueue.splice(playerIndexInQueue-1, 1);
			else _playersInQueue.splice(playerIndexInQueue, 1);
			
			const board = [
				[-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1]
			];

			const initGame = [player, opponent, board, 0]
			_playersInGame.push(initGame);
			console.log(initGame);
			app.emit('matchFound', [player, opponent]);
			app.emit('turn', initGame);
		}
	});

  	socket.on('turn', (move) => {
  		let state = [];
  		let index = 0;
  		for(i=0;i<_playersInGame.length;i++) {
  			if(_playersInGame[i][0] == socket.id || _playersInGame[i][1] == socket.id) {
  				state = _playersInGame[i];
  				index = i;
  				break;
  			} 
  		}		
  		if(move > 6) {
  			socket.emit('turn', state);
  		} else {
  			const dropMove = game.move(state[2], move-1, state[3]);
  			const isWin = game.analyze(dropMove.newboard, dropMove.droppos, state[3]); 
  			state[2] = dropMove.newboard;
			if(isWin) {
				_playersInGame.splice(index, 1);
				app.emit('win', state);
			} else {
				state[3] = (state[3] == 1)? 0 : 1;
				_playersInGame[index] = state;
				app.emit('turn', _playersInGame[index]);
			}		
  		}
  	});
});
