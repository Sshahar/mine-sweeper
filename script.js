'use strict'

// TODO: fix mark on bomb change cell size
// TODO: fix table overflows on Expert level
// TODO: add reset game button

var gBoard
var gLevel
var gGame

var MINE = '<img src="img/mine.png">'
var MARK = '<img src="img/mark.png">'

function onInit(level = 4) {
    setLevel(level)
    setGame()
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function setLevel(level) {
    switch (level) {
        case 4:
            gLevel = {
                SIZE: 4,
                MINES: 2
            }
            break
        case 8:
            gLevel = {
                SIZE: 8,
                MINES: 14
            }
            break
        case 12:
            gLevel = {
                SIZE: 12,
                MINES: 32
            }
    }
}

function setGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
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
            var classNames = board[i][j].isShown ? '' : 'hidden-cell'
            strHTML += `<td class="${classNames}" onclick="onCellClicked(this, ${i}, ${j})" ` +
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
    if (gBoard[i][j].isShown) return

    if (gBoard[i][j].isMarked) gGame.markedCount--
    gGame.shownCount++

    gBoard[i][j].isMarked = false
    gBoard[i][j].isShown = true

    // mine or last cell?
    checkGameOver(i, j)

    // is empty cell?
    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) {
        showNegs(i, j)
    }

    renderCell(i, j)
}

function onCellMarked(i, j) {
    if (gBoard[i][j].isShown) return
    gGame.markedCount += gBoard[i][j].isMarked ? -1 : 1
    console.log('gGame.markedCount:', gGame.markedCount)

    var elCell = document.querySelector(`td[data-i="${i}"][data-j="${j}"]`)
    elCell.classList.add('hidden-cell')

    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    renderCell(i, j)

    checkGameOver(i, j)
}

function checkGameOver(i, j) {
    if (gBoard[i][j].isMine && gBoard[i][j].isShown) {
        gGame.isOn = false
        onLose()
        return
    }

    // are all mines marked ?
    // are all non-mine cells shown?
    if (gGame.shownCount + gGame.markedCount === Math.pow(gLevel.SIZE, 2)) {
        gGame.isOn = false
        onWin()
    }
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

function onLose() {
    // Reveal all mines
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard)
}

function onWin() {
    alert('hurray!')
}

function onChangeLevel(level) {
    onInit(level)
}

function showNegs(i, j) {
    var negs = getNegs({i, j})

    for (var n=0; n<negs.length; n++) {
        var coord = negs[n]
        gBoard[coord.i][coord.j].isShown = true
        renderCell(coord.i, coord.j)
    }
}