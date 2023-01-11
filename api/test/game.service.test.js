const expect = require('chai').expect;
const Game = require('../service/game.service');

const inputs = {
	a: {
		'board': [[-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1]],
		'move': 0,
		'playerToMove': 0 
	},
	b: {
		'board': [[-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [1,-1,-1,-1,-1,-1]],
		'move': 0,
		'playerToMove': 0 	
	},
	c: {
		'board': [[-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [1,-1,-1,-1,-1,-1]],
		'move': 7,
		'playerToMove': 0 	
	}
}

const outputs = {
	a: {
		'newboard': [[-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [0,-1,-1,-1,-1,-1]],
		'droppos': {
			'row': 6,
			'col': 0
		}
	},
	b: {
		'newboard': [[-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1], [0,-1,-1,-1,-1,-1], [1,-1,-1,-1,-1,-1]],
		'droppos': {
			'row': 5,
			'col': 0
		}
	},
	c: -1
}

describe('Testing Game Service', () => {
	it('test input a', () => {
		expect(Game.move(inputs.a.board, inputs.a.move, inputs.a.playerToMove)).to.deep.nested.include(outputs.a);
	});
	it('test input b', () => {
		expect(Game.move(inputs.b.board, inputs.b.move, inputs.b.playerToMove)).to.deep.nested.include(outputs.b);
	});
	it('test input c', () => {
		expect(Game.move(inputs.c.board, inputs.c.move, inputs.c.playerToMove)).to.equal(outputs.c);
	});
});