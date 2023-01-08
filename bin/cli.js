#!/usr/bin/env node
const yargs = require('yargs');
const chalk = require('chalk');
const readline = require('readline');
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

console.log('connecting...');

socket.on('connect', () => {
    console.log(chalk.green('connected!')); 

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const START = 0;
    const EXIT = 1;
    
    rl.question('please state your nickname: ', (input) => {
        socket.emit('setnickname', input);     
    });

    socket.on('welcome', (message) => {
        console.log(chalk.green(message));
    });

    socket.on('option', () => {
        rl.question('[start] => 0 :: [exit] => 1\nplease enter choice: ', (choice) => {
            if(choice == START) {
                console.log('finding opponent....');
                socket.emit('start');
            } else { 

            }
        });
    });

    socket.on('matchFound', (matchup) => {
        if(matchup.indexOf(socket.id) != -1) console.log(chalk.green('match found!'));
    });

    socket.on('turn', (game) => {
        if(game[0] == socket.id || game[1] == socket.id) {
            let player = 0;
            let opponent = 1;
            if(game[0] != socket.id) {
                player = 1;
                opponent = 0;
            }
            const board = game[2];
            const isTurn = game[3];
            printBoard(board);
            if(isTurn == player) {
                console.log(chalk.yellow('your turn!'));
                rl.question('please enter column[1-6]: ', (move) => {
                    socket.emit('turn', move);
                });
            } else {
                console.log(chalk.yellow('opponent\'s turn...'));
            }
        }

    });

    socket.on('win', (game) => {
        const playerI = game[0];
        const playerII = game[1];
        const ID = socket.id;
        const winningPlayer = game[3]; 
        const board = game[2];

        if(playerI == ID || playerII == ID) {
            const player = (playerI == ID)? 0 : 1;
            printBoard(board); 
            if(player == winningPlayer) {
                console.log(chalk.green('\nYOU WIN!\n'));
            } else {
                console.log(chalk.red('\nYOU LOSE!\n'));    
            }

            socket.emit('end');
        }
    });

    function printBoard(board) {
        const a = setBoardCellValue(board[0][0]);
        const b = setBoardCellValue(board[0][1]);
        const c = setBoardCellValue(board[0][2]);
        const d = setBoardCellValue(board[0][3]);
        const e = setBoardCellValue(board[0][4]);
        const f = setBoardCellValue(board[0][5]);

        const g = setBoardCellValue(board[1][0]);
        const h = setBoardCellValue(board[1][1]);
        const i = setBoardCellValue(board[1][2]);
        const j = setBoardCellValue(board[1][3]);
        const k = setBoardCellValue(board[1][4]);
        const l = setBoardCellValue(board[1][5]);
        
        const m = setBoardCellValue(board[2][0]);
        const n = setBoardCellValue(board[2][1]);
        const o = setBoardCellValue(board[2][2]);
        const p = setBoardCellValue(board[2][3]);
        const q = setBoardCellValue(board[2][4]);
        const r = setBoardCellValue(board[2][5]);
        
        const s = setBoardCellValue(board[3][0]);
        const t = setBoardCellValue(board[3][1]);
        const u = setBoardCellValue(board[3][2]);
        const v = setBoardCellValue(board[3][3]);
        const w = setBoardCellValue(board[3][4]);
        const x = setBoardCellValue(board[3][5]);
        
        const y = setBoardCellValue(board[4][0]);
        const z = setBoardCellValue(board[4][1]);
        const aa = setBoardCellValue(board[4][2]);
        const ab = setBoardCellValue(board[4][3]);
        const ac = setBoardCellValue(board[4][4]);
        const ad = setBoardCellValue(board[4][5]);
        
        const ae = setBoardCellValue(board[5][0]);
        const af = setBoardCellValue(board[5][1]);
        const ag = setBoardCellValue(board[5][2]);
        const ah = setBoardCellValue(board[5][3]);
        const ai = setBoardCellValue(board[5][4]);
        const aj = setBoardCellValue(board[5][5]);
        
        const ak = setBoardCellValue(board[6][0]);
        const al = setBoardCellValue(board[6][1]);
        const am = setBoardCellValue(board[6][2]);
        const an = setBoardCellValue(board[6][3]);
        const ao = setBoardCellValue(board[6][4]);
        const ap = setBoardCellValue(board[6][5]);
        
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

});

