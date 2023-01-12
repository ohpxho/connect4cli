const MAXLINECONNECTION = 4;

function move(board, move, player) {
	for(i=board.length-1;i>=0;i--) {
		if(board[i][move] == -1) {
			board[i][move] = player;
			return {
				'newboard' : board, 
				'droppos' : {'row':i, 'col':move} //Inserted position of the player move
			};
		}	
	}
 
	return -1;
}

function isBoardFull(board) {
	for(i = 0; i < board.length; i++) {
		if(board[i].indexOf(-1) >= 0) 
			return false;
	}
	return true;
}

/** 
 * The algorithm will check the four directions:horizontal, vertical, and sides of the given position where players made the move.
 * Following with a DFS algorithm for checking the length of connected similar values in that position.
 * If the length of connected similar values is 4, then the players who made the last move wins.
**/

function analyze(board, position, piece) {
	const isHorizontalValid = checkHorizontal(board, position, piece);
	const isVerticalValid = checkVertical(board, position, piece);
	const isFsideValid = checkForwardSide(board, position, piece);
	const isBsideValid = checkBackwardSide(board, position, piece);

	if(isHorizontalValid || isVerticalValid || isFsideValid || isBsideValid) {
		return true;
	}
	
	return false;
}

function checkHorizontal(board, position, piece) {
	/**
	 * I need to copy the board into new array to prevent modifying it,
	   because visited indices value will be modified into -1
	**/
	let tempBoard = cloneBoard(board);
	let lineLength = 1;
	let queue = [position];

	tempBoard[queue[0].row][queue[0].col] = -1;
	
	while(queue.length != 0) {
		const currpos = queue.shift();
	
		const isLeftWithinRange = currpos.col-1>=0;
		if(isLeftWithinRange) {
			const isLeftEqualsPiece = tempBoard[currpos.row][currpos.col-1]==piece;
			if(isLeftEqualsPiece) {
				queue.push({'col':currpos.col-1, 'row':currpos.row});
				tempBoard[currpos.row][currpos.col-1] = -1;
				lineLength+=1;	
			}
		}

		const isRightWithinRange = currpos.col+1<tempBoard[0].length;
		if(isRightWithinRange) {
			const isRightEqualsPiece = tempBoard[currpos.row][currpos.col+1]==piece;
			if(isRightEqualsPiece) {
				queue.push({'col':currpos.col+1, 'row':currpos.row});
				tempBoard[currpos.row][currpos.col+1] = -1;
				lineLength+=1;	
			}
		}
	}

	return (lineLength>=MAXLINECONNECTION) ? true : false;
}

function checkVertical(board, position, piece) {	
	/**
	 * I need to copy the board into new array to prevent modifying it,
	   because visited indices value will be modified into -1
	**/
	let tempBoard = cloneBoard(board);
	let lineLength = 1;
	let queue = [position];
	
	tempBoard[queue[0].row][queue[0].col] = -1;
	
	while(queue.length != 0) {
		const currpos = queue.shift();

		const isTopWithinRange = currpos.row-1>=0;
		if(isTopWithinRange) {
			const isTopEqualsPiece = tempBoard[currpos.row-1][currpos.col]==piece;
			if(isTopEqualsPiece) {
				queue.push({'col':currpos.col, 'row':currpos.row-1});
				tempBoard[currpos.row-1][currpos.col] = -1;
				lineLength+=1;
			}
		}

		const isBottomWithinRange = currpos.row+1<tempBoard.length;
		if(isBottomWithinRange) {
			const isBottomEqualsPiece = tempBoard[currpos.row+1][currpos.col]==piece;
			if(isBottomEqualsPiece) {	
				queue.push({'col':currpos.col, 'row':currpos.row+1});
				tempBoard[currpos.row+1][currpos.col] = -1;
				lineLength+=1;	
			}
		}
	}

	return (lineLength>=MAXLINECONNECTION) ? true : false;
}

function checkForwardSide(board, position, piece) {
	/**
	 * I need to copy the board into new array to prevent modifying it,
	   because visited indices value will be modified into -1
	**/
	let tempBoard = cloneBoard(board);
	let lineLength = 1;
	let queue = [position];

	tempBoard[queue[0].row][queue[0].col] = -1;

	while(queue.length != 0) {
		const currpos = queue.shift();
		
		const isTopWithinRange = currpos.row-1>=0;
		const isRightWithinRange = currpos.col+1<board[0].length;
		if(isTopWithinRange && isRightWithinRange) {
			const isTopRightEqualsPiece = tempBoard[currpos.row-1][currpos.col+1]==piece;
			if(isTopRightEqualsPiece) {
				queue.push({'col':currpos.col+1, 'row':currpos.row-1});
				tempBoard[currpos.row-1][currpos.col+1] = -1;
				lineLength+=1;	
			}
		}

		const isBottomWithinRange = currpos.row+1<board.length;
		const isLeftWithinRange = currpos.col-1>=0;
		if(isBottomWithinRange && isLeftWithinRange) {
			const isBottomLeftEqualsPiece = tempBoard[currpos.row+1][currpos.col-1]==piece;
			if(isBottomLeftEqualsPiece) {
				queue.push({'col':currpos.col-1, 'row':currpos.row+1});
				tempBoard[currpos.row+1][currpos.col-1] = -1;
				lineLength+=1;
			}
		}
	}

	return (lineLength>=MAXLINECONNECTION) ? true : false;

}

function checkBackwardSide(board, position, piece) {
	/**
	 * I need to copy the board into new array to prevent modifying it,
	   because visited indices value will be modified into -1
	**/
	let tempBoard = cloneBoard(board);
	let lineLength = 1;
	let queue = [position];
	tempBoard[queue[0].row][queue[0].col] = -1; 
	
	while(queue.length != 0) {
		const currpos = queue.shift();

		const isTopWithinRange = currpos.row-1>=0;
		const isLeftWithinRange = currpos.col-1>=0;
		if(isTopWithinRange && isLeftWithinRange) {
			const isTopLeftEqualsPiece = tempBoard[currpos.row-1][currpos.col-1]==piece;
			if(isTopLeftEqualsPiece) {
				queue.push({'col':currpos.col-1, 'row':currpos.row-1});
				tempBoard[currpos.row-1][currpos.col-1] = -1;
				lineLength+=1;
			}
		}

		const isBottomWithinRange = currpos.row+1<board.length;
		const isRightWithinRange = currpos.col+1<board[0].length;
		if(isBottomWithinRange && isRightWithinRange) {
			const isBottomRightEqualsPiece = tempBoard[currpos.row+1][currpos.col+1]==piece;
			if(isBottomRightEqualsPiece) {
				queue.push({'col':currpos.col+1, 'row':currpos.row+1});
				tempBoard[currpos.row+1][currpos.col+1] = -1;
				lineLength+=1;
			}
		}
	}

	return (lineLength>=MAXLINECONNECTION) ? true : false;
}

function cloneBoard(board) {
	return board.map((row) => {
		return row.slice();
	});	
}

module.exports = {
	analyze,
	move,
	isBoardFull
}