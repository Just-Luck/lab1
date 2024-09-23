const CROSS = 'X';
const ZERO = 'O';
const EMPTY = '';

const container = document.getElementById('fieldWrapper');

let game = {
    winner: false,
    move: 0,
    field: [],
    size: 3,
    reset: function(size = 3) {
        this.winner = false;
        this.move = 0;
        this.size = size;
        this.field = Array(size).fill().map(() => Array(size).fill(EMPTY));
    },
    expandField: function() {
        this.field.unshift(Array(this.size).fill(EMPTY));
        this.field.push(Array(this.size).fill(EMPTY));
        this.field.forEach(row => {
            row.unshift(EMPTY);
            row.push(EMPTY);
        });

        this.size += 2; 
        renderGrid(this.size);
    }
}

startGame();
addResetListener();

function startGame() {
    let dimension = parseInt(prompt("Введите размер поля (например, 3 для 3x3): ", "3"));
    if (isNaN(dimension) || dimension <= 1) dimension = 3; 
    game.reset(dimension);
    renderGrid(dimension);
}

function renderGrid(dimension) {
    container.innerHTML = '';
    for (let i = 0; i < dimension; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < dimension; j++) {
            const cell = document.createElement('td');
            cell.textContent = game.field[i][j]; 
            cell.addEventListener('click', () => cellClickHandler(i, j));
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}

function checkBoard() {
    const { field, size } = game;

    for (let i = 0; i < size; i++) {
        if (field[i].every(cell => cell === field[i][0] && cell !== EMPTY)) {
            game.winner = field[i][0];
            highlightWinningCells(field[i].map((_, idx) => [i, idx]));
            return alertEndGame();
        }
        if (field.every(row => row[i] === field[0][i] && row[i] !== EMPTY)) {
            game.winner = field[0][i];
            highlightWinningCells(field.map((_, idx) => [idx, i]));
            return alertEndGame();
        }
    }

    if (field.every((row, idx) => row[idx] === field[0][0] && row[idx] !== EMPTY)) {
        game.winner = field[0][0];
        highlightWinningCells(field.map((_, idx) => [idx, idx]));
        return alertEndGame();
    }

    if (field.every((row, idx) => row[size - 1 - idx] === field[0][size - 1] && row[size - 1 - idx] !== EMPTY)) {
        game.winner = field[0][size - 1];
        highlightWinningCells(field.map((_, idx) => [idx, size - 1 - idx]));
        return alertEndGame();
    }

    if (game.move >= size * size) {
        game.winner = 'draw';
        return alertEndGame();
    }

    if (game.move > (size * size) / 2) game.expandField();
}

function alertEndGame() {
    alert('Игра закончилась! ' + (game.winner === 'draw' ? 'Победила дружба' : 'Победил ' + game.winner) + '. Игра закончилась за ' + game.move + ' ходов.');
}

function highlightWinningCells(cells) {
    for (const [row, col] of cells) renderSymbolInCell(game.winner, row, col, 'red');
}

function aiMove() {
    if (game.winner || game.move >= game.field.length * game.field.length) return; 

    const { field, size } = game;

    for (let i = 0; i < size; i++) {
        let row = field[i];
        if (row.filter(cell => cell === ZERO).length === size - 1 && row.includes(EMPTY)) {
            let col = row.indexOf(EMPTY);
            return cellClickHandler(i, col);
        }
    }

    for (let i = 0; i < size; i++) {
        let column = field.map(row => row[i]);
        if (column.filter(cell => cell === ZERO).length === size - 1 && column.includes(EMPTY)) {
            let row = column.indexOf(EMPTY);
            return cellClickHandler(row, i);
        }
    }

    let mainDiagonal = field.map((row, idx) => row[idx]);
    if (mainDiagonal.filter(cell => cell === ZERO).length === size - 1 && mainDiagonal.includes(EMPTY)) {
        let idx = mainDiagonal.indexOf(EMPTY);
        return cellClickHandler(idx, idx);
    }

    let antiDiagonal = field.map((row, idx) => row[size - 1 - idx]);
    if (antiDiagonal.filter(cell => cell === ZERO).length === size - 1 && antiDiagonal.includes(EMPTY)) {
        let idx = antiDiagonal.indexOf(EMPTY);
        return cellClickHandler(idx, size - 1 - idx);
    }

    let emptyCells = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (field[i][j] === EMPTY) emptyCells.push([i, j]);
        }
    }

    if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [row, col] = emptyCells[randomIndex];
        cellClickHandler(row, col);
    }
}

async function cellClickHandler(row, col) {
    if (game.move >= game.field.length * game.field.length) return alert('Игра закончилась!');
    if (game.winner) return alert('Игра закончилась! ' + (game.winner === 'draw' ? 'Победила дружба' : 'Победил ' + game.winner) + '. Игра закончилась за ' + game.move + ' ходов.');
    if (game.field[row][col] != EMPTY) return alert('Самый умный? Занято!');
    
    symbol = ++game.move % 2 === 0 ? ZERO : CROSS;
    game.field[row][col] = symbol;
    renderSymbolInCell(symbol, row, col);
    checkBoard();

    if (symbol === CROSS && !game.winner) aiMove();
}

function renderSymbolInCell(symbol, row, col, color = '#333') {
    const targetCell = findCell(row, col);
    targetCell.textContent = symbol;
    targetCell.style.color = color;
}

function findCell(row, col) {
    const targetRow = container.querySelectorAll('tr')[row];
    return targetRow.querySelectorAll('td')[col];
}

function addResetListener() {
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetClickHandler);
}

function resetClickHandler() {
    startGame();
}

function clickOnCell (row, col) {
    findCell(row, col).click();
}