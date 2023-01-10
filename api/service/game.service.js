//TODO:: function for draw

const MAXLINECONNECTION = 4;

function move(board, move, player) {
	for(i=board.length-1;i>=0;i--) {
		if(board[i][move] == -1) {
			board[i][move] = player;
			return {
				'newboard' : board, 
				'droppos' : {'row':i, 'col':move} //inserted position of the player move
			};
		}	
	}
 
	return -1;
}

//The algorithm will check the four directions:horizontal, vertical, and sides of the given position where players made the move.
//Following a dfs algorithm for checking the length of connected similar values in that position.
//If the length of connected similar values is 4, then the players wins.

function analyze(board, position, piece) {
	const horizontal = checkHorizontal(board, position, piece);
	const vertical = checkVertical(board, position, piece);
	const fside = checkForwardSide(board, position, piece);
	const bside = checkBackwardSide(board, position, piece);

	if(horizontal || vertical || bside || fside) {
		return true;
	}

	return false;
}

function checkHorizontal(board, position, piece) {
	let tempBoard = board.map((row) => {
		return row.slice();
	});
	let lineLength = 1;
	let queue = [position];
	tempBoard[queue[0].row][queue[0].col] = -1;
	while(queue.length != 0) {
		const currpos = queue.shift();

		if(currpos.col-1>=0 && tempBoard[currpos.row][currpos.col-1]==piece) {
			queue.push({'col':currpos.col-1, 'row':currpos.row});
			tempBoard[currpos.row][currpos.col-1] = -1;
			lineLength+=1;
		}

		if(currpos.col+1<tempBoard[0].length && tempBoard[currpos.row][currpos.col+1]==piece) {
			queue.push({'col':currpos.col+1, 'row':currpos.row});
			tempBoard[currpos.row][currpos.col+1] = -1;
			lineLength+=1;
		}
	}

	return (lineLength>=MAXLINECONNECTION) ? true : false;
}

function checkVertical(board, position, piece) {
	let tempBoard = board.map((row) => {
		return row.slice();
	});
	let lineLength = 1;
	let queue = [position];
	tempBoard[queue[0].row][queue[0].col] = -1;
	while(queue.length != 0) {
		const currpos = queue.shift();

		if(currpos.row-1>=0 && tempBoard[currpos.row-1][currpos.col]==piece) {
			queue.push({'col':currpos.col, 'row':currpos.row-1});
			tempBoard[currpos.row-1][currpos.col] = -1;
			lineLength+=1;
		}

		if(currpos.row+1<tempBoard.length && tempBoard[currpos.row+1][currpos.col]==piece) {
			queue.push({'col':currpos.col, 'row':currpos.row+1});
			tempBoard[currpos.row+1][currpos.col] = -1;
			lineLength+=1;
		}
	}

	return (lineLength>=MAXLINECONNECTION) ? true : false;
}

function checkForwardSide(board, position, piece) {
	let tempBoard = board.map((row) => {
		return row.slice();
	});
	let lineLength = 1;
	let queue = [position];
	tempBoard[queue[0].row][queue[0].col] = -1;
	while(queue.length != 0) {
		const currpos = queue.shift();

		if((currpos.row-1>=0 && currpos.col+1<board[0].length) && tempBoard[currpos.row-1][currpos.col+1]==piece) {
			queue.push({'col':currpos.col+1, 'row':currpos.row-1});
			tempBoard[currpos.row-1][currpos.col+1] = -1;
			lineLength+=1;
		}

		if((currpos.row+1<board.length && currpos.col-1>=0) && tempBoard[currpos.row+1][currpos.col-1]==piece) {
			queue.push({'col':currpos.col-1, 'row':currpos.row+1});
			tempBoard[currpos.row+1][currpos.col-1] = -1;
			lineLength+=1;
		}
	}

	return (lineLength>=MAXLINECONNECTION) ? true : false;

}

function checkBackwardSide(board, position, piece) {
	let tempBoard = board.map((row) => {
		return row.slice();
	});
	let lineLength = 1;
	let queue = [position];
	tempBoard[queue[0].row][queue[0].col] = -1;
	while(queue.length != 0) {
		const currpos = queue.shift();

		if((currpos.row-1>=0 && currpos.col-1<board[0].length) && tempBoard[currpos.row-1][currpos.col-1]==piece) {
			queue.push({'col':currpos.col-1, 'row':currpos.row-1});
			tempBoard[currpos.row-1][currpos.col-1] = -1;
			lineLength+=1;
		}

		if((currpos.row+1<board.length && currpos.col+1>=0) && tempBoard[currpos.row+1][currpos.col+1]==piece) {
			queue.push({'col':currpos.col+1, 'row':currpos.row+1});
			tempBoard[currpos.row+1][currpos.col+1] = -1;
			lineLength+=1;
		}
	}

	return (lineLength>=MAXLINECONNECTION) ? true : false;
}

module.exports = {
	analyze,
	move
}