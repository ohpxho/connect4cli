#!/usr/bin/env node
require('dotenv').config();
const yargs = require('yargs');
const chalk = require('chalk');
const readline = require('readline');
const io = require('socket.io-client');
const socket = io(`http://localhost:${process.env.PORT}`);
console.log('connecting...');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

socket.on('connect', () => {
    console.log(chalk.green('connected!'));
    
    rl.question('please state your nickname: ', (input) => {
        socket.emit('setnickname', input);     
    });

    socket.on('welcome', (message) => {
        console.log(chalk.green(message));
    });

    socket.on('option', () => {
        rl.question('[start] => 0 :: [exit] => 1\nplease enter choice: ', (choice) => {
            const START = 0;
            if(choice == START) {
                console.log('finding opponent....');
                socket.emit('start');
            } else { 
                process.exit();
            }
        });
    });

    socket.on('matchFound', (matchup) => {
        const ID = socket.id;
        if(isPlayerInMatchUp(matchup, ID)) 
            console.log(chalk.green('match found!'));
    });

    socket.on('turn', (game) => {
        const ID = socket.id;
        if(isPlayerInGame(game, ID)) {
            printBoard(game.board);
            if(isTurn(game, ID)) {
                console.log(chalk.yellow('your turn!'));
                rl.question('please enter column[1-6]: ', (move) => {
                    socket.emit('turn', move);
                });
            } else {
                console.log(chalk.yellow('opponent\'s turn...'));
            }
        }

    });

    socket.on('error', (message) => {
        console.log(chalk.red(message));
    });

    socket.on('win', (game) => {
        const ID = socket.id;
        if(isPlayerInGame(game, ID)) {
            const player = (game.playerI == ID)? 0 : 1;
            const winningPlayer = game.playerToMove;
            printBoard(game.board); 
            if(player == winningPlayer) {
                console.log(chalk.green('\nYOU WIN!\n'));
            } else {
                console.log(chalk.red('\nYOU LOSE!\n'));    
            }

            socket.emit('end');
        }
    });

    socket.on('opponent_disconnected', (game) => {
        const ID = socket.id;
        if(game.playerI == ID || game.playerII == ID) {
            rl.write('e\n');
            console.log(chalk.red('\nopponent disconnected.\n'));
            socket.emit('end');
        }
    });

    socket.on('draw', (game) => {
        const ID = socket.id;
        if(game.playerI == ID || game.playerII == ID) {
            printBoard(game.board); 
            console.log(chalk.yellow('\nGAME DRAW!\n'));    
            socket.emit('end');
        }
    });

    socket.on('disconnect', () => {
        console.log(chalk.red('server disconnected!'));
        process.exit();
    });

});

function isPlayerInMatchUp(matchup, id) {
    return matchup.indexOf(id) != -1;
}

function isPlayerInGame(game, id) {
    return (game.playerI == id || game.playerII == id);
}

function isTurn(game, player) {
    const playerValue = (player == game.playerI)? 0 : 1;
    if(playerValue == game.playerToMove) 
        return true;
    return false;
}

function printBoard(board) {
    const a = setBoardCellValue(board[0][0]), b = setBoardCellValue(board[0][1]), c = setBoardCellValue(board[0][2]);
    const d = setBoardCellValue(board[0][3]), e = setBoardCellValue(board[0][4]), f = setBoardCellValue(board[0][5]);
    const g = setBoardCellValue(board[1][0]), h = setBoardCellValue(board[1][1]), i = setBoardCellValue(board[1][2]);
    const j = setBoardCellValue(board[1][3]), k = setBoardCellValue(board[1][4]), l = setBoardCellValue(board[1][5]);
    const m = setBoardCellValue(board[2][0]), n = setBoardCellValue(board[2][1]), o = setBoardCellValue(board[2][2]);
    const p = setBoardCellValue(board[2][3]), q = setBoardCellValue(board[2][4]), r = setBoardCellValue(board[2][5]);
    const s = setBoardCellValue(board[3][0]), t = setBoardCellValue(board[3][1]), u = setBoardCellValue(board[3][2]);
    const v = setBoardCellValue(board[3][3]), w = setBoardCellValue(board[3][4]), x = setBoardCellValue(board[3][5]);
    const y = setBoardCellValue(board[4][0]), z = setBoardCellValue(board[4][1]), aa = setBoardCellValue(board[4][2]);
    const ab = setBoardCellValue(board[4][3]), ac = setBoardCellValue(board[4][4]), ad = setBoardCellValue(board[4][5]);
    const ae = setBoardCellValue(board[5][0]), af = setBoardCellValue(board[5][1]), ag = setBoardCellValue(board[5][2]);
    const ah = setBoardCellValue(board[5][3]), ai = setBoardCellValue(board[5][4]), aj = setBoardCellValue(board[5][5]);
    const ak = setBoardCellValue(board[6][0]), al = setBoardCellValue(board[6][1]), am = setBoardCellValue(board[6][2]);
    const an = setBoardCellValue(board[6][3]), ao = setBoardCellValue(board[6][4]), ap = setBoardCellValue(board[6][5]);
    
    console.log(` 1  2  3  4  5  6 `);
    console.log('-----------------------');
    console.log(`${a} | ${b} | ${c} | ${d} | ${e} | ${f} |`);
    console.log('-----------------------');
    console.log(`${g} | ${h} | ${i} | ${j} | ${k} | ${l} |`);
    console.log('-----------------------');
    console.log(`${m} | ${n} | ${o} | ${p} | ${q} | ${r} |`);
    console.log('-----------------------');
    console.log(`${s} | ${t} | ${u} | ${v} | ${w} | ${x} |`);
    console.log('-----------------------');
    console.log(`${y} | ${z} | ${aa} | ${ab} | ${ac} | ${ad} |`);
    console.log('-----------------------');
    console.log(`${ae} | ${af} | ${ag} | ${ah} | ${ai} | ${aj} |`);
    console.log('-----------------------');
    console.log(`${ak} | ${al} | ${am} | ${an} | ${ao} | ${ap} |`);
    console.log('-----------------------');
}

function setBoardCellValue(val) {
    switch(val) {
        case 0:
            return chalk.blue('o');
            break;
        case 1:
            return chalk.red('o');
            break;
        default:
            return ' ';
    }
}
