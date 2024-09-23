const SYMBOLS = {
    CROSS: 'X',
    ZERO: 'O',
    EMPTY: ''
}

const container = document.getElementById('fieldWrapper');

//*Объект для сохранения состояния игры
let game = {
    winner: false,
    move: 0,
    field: [],
    size: 3,
    reset: function(size = 3) {  //?Функция для возвращения игры в начальное состояние
        this.winner = false;
        this.move = 0;
        this.size = size;
        this.field = Array(size).fill().map(() => Array(size).fill(SYMBOLS.EMPTY));
    },
    expandField: function() { //?Функция для расширения поля
        this.field.unshift(Array(this.size).fill(SYMBOLS.EMPTY));
        this.field.push(Array(this.size).fill(SYMBOLS.EMPTY));
        this.field.forEach(row => {
            row.unshift(SYMBOLS.EMPTY);
            row.push(SYMBOLS.EMPTY);
        });
        this.size += 2; 
        renderGrid(this.size);
    }
}

startGame(); //*Запускаем игру
addResetListener(); //*Начинаем отслеживать нажатие на кнопку

//*Функция начала игры
function startGame() {
    let dimension = parseInt(prompt("Введите размер поля (например, 3 для 3x3): ", "3"));
    if (isNaN(dimension) || dimension <= 1) dimension = 3; 
    game.reset(dimension);
    renderGrid(dimension);
}

//*Функция отрисовки поля
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

//*Функция для проверки состояния игры
function checkBoard() {
    const { field, size } = game;
    //?Проверяем столбцы & строки
    for (let i = 0; i < size; i++) {
        if (field[i].every(cell => cell === field[i][0] && cell !== SYMBOLS.EMPTY)) {
            game.winner = field[i][0];
            highlightWinningCells(field[i].map((_, idx) => [i, idx]));
            return alertEndGame();
        }
        if (field.every(row => row[i] === field[0][i] && row[i] !== SYMBOLS.EMPTY)) {
            game.winner = field[0][i];
            highlightWinningCells(field.map((_, idx) => [idx, i]));
            return alertEndGame();
        }
    }

    //?Проверяем диагонали
    if (field.every((row, idx) => row[idx] === field[0][0] && row[idx] !== SYMBOLS.EMPTY)) {
        game.winner = field[0][0];
        highlightWinningCells(field.map((_, idx) => [idx, idx]));
        return alertEndGame();
    }
    if (field.every((row, idx) => row[size - 1 - idx] === field[0][size - 1] && row[size - 1 - idx] !== SYMBOLS.EMPTY)) {
        game.winner = field[0][size - 1];
        highlightWinningCells(field.map((_, idx) => [idx, size - 1 - idx]));
        return alertEndGame();
    }

    //?Проверка на ничью (Не используется, после добавления функции расширения поля)
    if (game.move >= size * size) {
        game.winner = 'draw';
        return alertEndGame();
    }

    //?Расширяем поле
    if (game.move > (size * size) / 2) return game.expandField(); 
}

//*Функция уведомления о завершении игры
function alertEndGame() {
    alert('Игра закончилась! ' + (game.winner === 'draw' ? 'Победила дружба' : 'Победил ' + game.winner) + '. Игра закончилась за ' + game.move + ' ходов.');
}

//*Функция для покраски клеток
function highlightWinningCells(cells) {
    for (const [row, col] of cells) renderSymbolInCell(game.winner, row, col, 'red');
}

//*Функция для одиночной игры(Автоматическая установка O)
function aiMove() {
    if (game.winner || game.move >= game.field.length * game.field.length) return; 

    const { field, size } = game;

    //?Проверка строк на победу
    for (let i = 0; i < size; i++) {
        let row = field[i];
        if (row.filter(cell => cell === SYMBOLS.ZERO).length === size - 1 && row.includes(SYMBOLS.EMPTY)) {
            let col = row.indexOf(SYMBOLS.EMPTY);
            return cellClickHandler(i, col);
        }
    }

    //?Проверка столбцов на победу
    for (let i = 0; i < size; i++) {
        let column = field.map(row => row[i]);
        if (column.filter(cell => cell === SYMBOLS.ZERO).length === size - 1 && column.includes(SYMBOLS.EMPTY)) {
            let row = column.indexOf(SYMBOLS.EMPTY);
            return cellClickHandler(row, i);
        }
    }

     //?Проверка главной диагоналей на победу
    let mainDiagonal = field.map((row, idx) => row[idx]);
    if (mainDiagonal.filter(cell => cell === SYMBOLS.ZERO).length === size - 1 && mainDiagonal.includes(SYMBOLS.EMPTY)) {
        let idx = mainDiagonal.indexOf(SYMBOLS.EMPTY);
        return cellClickHandler(idx, idx);
    }
    let antiDiagonal = field.map((row, idx) => row[size - 1 - idx]);
    if (antiDiagonal.filter(cell => cell === SYMBOLS.ZERO).length === size - 1 && antiDiagonal.includes(SYMBOLS.EMPTY)) {
        let idx = antiDiagonal.indexOf(SYMBOLS.EMPTY);
        return cellClickHandler(idx, size - 1 - idx);
    }

     //?Находим все свободные клетки
    let emptyCells = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (field[i][j] === SYMBOLS.EMPTY) emptyCells.push([i, j]);
        }
    }

    //?Выбираем случайную из предыдущего шага
    if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [row, col] = emptyCells[randomIndex];
        cellClickHandler(row, col);
    }
}

//*Функция обработки события нажатия на клетку
async function cellClickHandler(row, col) {
    if (game.move >= game.field.length * game.field.length) return alert('Игра закончилась!');
    if (game.winner) return alert('Игра закончилась! ' + (game.winner === 'draw' ? 'Победила дружба' : 'Победил ' + game.winner) + '. Игра закончилась за ' + game.move + ' ходов.');
    if (game.field[row][col] != SYMBOLS.EMPTY) return alert('Самый умный? Занято!');
    
    symbol = ++game.move % 2 === 0 ? SYMBOLS.ZERO : SYMBOLS.CROSS;
    game.field[row][col] = symbol;
    renderSymbolInCell(symbol, row, col);
    checkBoard();

    if (symbol === SYMBOLS.CROSS && !game.winner) aiMove();
}

//*Функция отрисовки символа
function renderSymbolInCell(symbol, row, col, color = '#333') {
    const targetCell = findCell(row, col);
    targetCell.textContent = symbol;
    targetCell.style.color = color;
}

//*Поиск элемента ячейки
function findCell(row, col) {
    const targetRow = container.querySelectorAll('tr')[row];
    return targetRow.querySelectorAll('td')[col];
}

//*Функция обработки события нажатия на кнопку
function addResetListener() {
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', startGame);
}