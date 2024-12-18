'use strict'

var gBoard
var gLevel
var gGame

var MINE = '💣'


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
    board[0][0].isMine = true
    board[2][2].isMine = true
    setMinesNegsCount(board)
    
    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = getNegMines({ i, j }, board).length
        }
    }
}

function renderBoard(board) {
    var strHTML = '<table>'

    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cellContent = board[i][j].isMine ? MINE : board[i][j].minesAroundCount
            strHTML += `<td>`+
            `${cellContent}`+
            `</td>`
        }
        strHTML += '</tr>'
    }

    strHTML += '</table>'
    document.querySelector('div.game-container').innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {

}

function onCellMarked(elCell) {

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