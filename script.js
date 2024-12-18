'use strict'

var gBoard
var gLevel
var gGame

var MINE = '<img src="img/mine.png">'
var MARK = '<img src="img/mark.png">'

function onInit() {
    setLevel()
    gGame = setGame()
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function setLevel() {
    gLevel = {
        SIZE: 4,
        MINES: 2
    }
}

function setGame() {

}

function buildBoard() {
    // Builds the board
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false }
        }
    }

    // Set the mines
    placeMines(board)
    setMinesNegsCount(board)

    return board
}

function placeMines(board) {
    board[0][0].isMine = true
    board[2][2].isMine = true

    // var emptyCells = getEmptyCells(gLevel.SIZE, board)
    // for (var mineCnt = gLevel.MINES; mineCnt>0; mineCnt--) {
    //     var rndIdx = getRandomInt(0, emptyCells.length)
    //     console.log('rndIdx:', rndIdx)
    //     var cellCoord = emptyCells.splice(rndIdx, 1)[0]
    //     console.log('cellCoord:', cellCoord)
    //     board[cellCoord.i][cellCoord.j].isMine = true
    // }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = getNegMines({ i, j }, board).length
        }
    }
}

function renderBoard(board) {
    var strHTML = `<table class="game-board"><tbody>`

    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cellContent = getCellContent(i, j)
            strHTML += `<td class="hidden-cell" onclick="onCellClicked(this, ${i}, ${j})" ` +
                `oncontextmenu="onCellMarked(${i}, ${j})"` +
                `data-i="${i}" data-j="${j}">` +
                `${cellContent}` +
                `</td>`
        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>'
    document.querySelector('div.game-container').innerHTML = strHTML
}

function renderCell(i, j) {
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) return

    var elCell = document.querySelector(`td[data-i="${i}"][data-j="${j}"]`)
    elCell.innerHTML = getCellContent(i, j)
    elCell.classList.remove('hidden-cell')
}

function onCellClicked(elCell, i, j) {
    gBoard[i][j].isMarked = false
    gBoard[i][j].isShown = true
    renderCell(i, j)
}

function onCellMarked(i, j) {
    if (gBoard[i][j].isShown) return

    var elCell = document.querySelector(`td[data-i="${i}"][data-j="${j}"]`)
    elCell.classList.add('hidden-cell')

    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    renderCell(i, j)
}

function checkGameOver() {
    // are all mines marked ?

    // are all non-mine cells shown?
}

function expandShown(board, elCell, i, j) {

}

function getNegMines(coord, board) {
    var res = []
    var negs = getNegs(coord)

    for (var i = 0; i < negs.length; i++) {
        var currNeg = negs[i]
        if (board[currNeg.i][currNeg.j].isMine) res.push(currNeg)
    }

    return res
}

function getCellContent(i, j) {
    if (gBoard[i][j].isMarked) return MARK
    if (gBoard[i][j].isMine) return MINE
    return gBoard[i][j].minesAroundCount
}