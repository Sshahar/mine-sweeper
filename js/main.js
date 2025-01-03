'use strict'

// TODO: fix UNDO reset safeClickCount: 3, canMineExterminator: true,

var gBoard
var gGame
var gFirstMoveCoord


var MINE = '<img src="img/mine.png">'
var MARK = '<img src="img/mark.png">'
var SAFE = '🏳️'
var LOSE = '🤯'
var WIN = '😎'
var ONGOING = '😄'

function onInit(level = 4, isUndo) {
    // Set total mine count & board size
    setLevel(level)
    
    setGame()
    setLeaderboard()
    setHints()
    gBoard = buildBoard()
    renderBoard(gBoard)
    getStorage()

    if (!isUndo) {
        setUndo()
        setTimer()
        setMegaHint()
        gUndo.isActive = false
    }
}

function setGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        LIVES: 3, // undo undo
        isEditorMode: false,
        safeClickCount: 3, // undo undo
        canMineExterminator: true, // undo undo
        canMegaHint: true, // undo undo
    }
    renderStats()
    document.querySelector('.game-state').innerHTML = ONGOING
}


function setUndo() {
    gUndo = {}
    gUndo.moveQueue = []
}

function buildBoard() {
    // Builds the board
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false, iaSafe: false }
        }
    }

    return board
}

function setMines(board) {
    placeMines(board)
    setMinesNegsCount(board)
}

function placeMines(board) {
    // board[0][0].isMine = true
    // board[2][2].isMine = true

    var emptyCells = getEmptyCells(gLevel.SIZE, board)
    for (var mineCnt = gLevel.MINES; mineCnt > 0; mineCnt--) {
        var rndIdx = getRandomInt(0, emptyCells.length)
        console.log('rndIdx:', rndIdx)
        var cellCoord = emptyCells.splice(rndIdx, 1)[0]
        console.log('cellCoord:', cellCoord)
        board[cellCoord.i][cellCoord.j].isMine = true
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = getNegMines({ i, j }, board).length
            renderCell(i, j)
        }
    }
}

function renderBoard(board) {
    var strHTML = ``

    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cellContent = getCellContent(i, j)
            var classNames = board[i][j].isShown ? '' : 'hidden-cell'
            strHTML += `<td class="${classNames}" onclick="onCellClicked(${i}, ${j})" ` +
                `oncontextmenu="onCellMarked(${i}, ${j})"` +
                `data-i="${i}" data-j="${j}">` +
                `<span class='cell-content'>${cellContent}</span>` +
                `</td>`
        }
        strHTML += '</tr>'
    }

    document.querySelector('section.game-container>table.game-board').innerHTML = strHTML
}

function renderCell(i, j) {
    var elCell = document.querySelector(`td[data-i="${i}"][data-j="${j}"]`)
    var cell = gBoard[i][j] 
    if (!cell.isShown && !cell.isMarked && !cell.isSafe && !cell.isHint && !gMegaHint.isMegaHint) {
        elCell.classList.add('hidden-cell')
        return
    }
    var elCellContent = document.querySelector(`td[data-i="${i}"][data-j="${j}"]>span.cell-content`)
    elCellContent.innerHTML = getCellContent(i, j)
    elCell.classList.remove('hidden-cell')
}

function onCellClicked(i, j) {
    if (!gGame.isOn && !gGame.isEditorMode && !gGame.shownCount) {
        startGame(i, j)
        startUndo()
    } else if (gGame.isHint) {
        revealHint({ i, j })
        gGame.isHint = false
        return
    } else if (gGame.isEditorMode) {
        onEditorMode(i, j)
        return
    } else if (!gGame.isOn) return
    else if (gMegaHint.isMegaHint) {
        handleMegaHint(i, j)
        return
    }

    gUndo.moveQueue.push({ i, j })

    setCellShown(i, j)

    // is empty cell?
    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) {
        setNegsShown(i, j)
    }

    // mine or last cell?
    checkGameOver(i, j)
}

function onCellMarked(i, j) {
    if (gBoard[i][j].isShown) return
    if (!gGame.isOn) return

    gGame.markedCount += gBoard[i][j].isMarked ? -1 : 1

    var elCell = getElCell({ i, j })
    elCell.classList.add('hidden-cell')

    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    renderCell(i, j)

    checkGameOver(i, j)
}

function checkGameOver(i, j) {
    if (!gGame.isOn) return

    if (gBoard[i][j].isMine && gBoard[i][j].isShown) {
        gGame.LIVES--
        renderStats()
        if (gGame.LIVES <= 0) {
            gGame.isOn = false
            clearInterval(gTimer.interval)
            onLose()
            return
        }
    }

    // are all mines marked ?
    // are all non-mine cells shown?
    var markedMinesCnt = 0
    var nonMineShownCnt = 0
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine && (gBoard[i][j].isMarked || gBoard[i][j].isShown)) markedMinesCnt++
            if (!gBoard[i][j].isMine && gBoard[i][j].isShown) nonMineShownCnt++
        }
    }
    if (markedMinesCnt + nonMineShownCnt === Math.pow(gLevel.SIZE, 2)) {
        gGame.isOn = false
        clearInterval(gTimer.interval)
        onWin()
    }
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

function onLose() {
    console.log('you lost')
    document.querySelector('.game-state').innerHTML = LOSE
    // Reveal all mines
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true
                gBoard[i][j].isMarked = false
            }

        }
    }
    renderBoard(gBoard)
}

function onWin() {
    console.log('you won')
    document.querySelector('.game-state').innerHTML = WIN
    addLeaderboard()
    setStorage()
    renderLeaderboard()
}


function setNegsShown(i, j) {
    var negs = getNegs({ i, j })

    for (var n = 0; n < negs.length; n++) {
        var coord = negs[n]
        var shouldShowNegs = !gBoard[coord.i][coord.j].isShown && !gBoard[coord.i][coord.j].minesAroundCount
        setCellShown(coord.i, coord.j)
        if (shouldShowNegs) setNegsShown(coord.i, coord.j)
    }
}

function setCellShown(i, j) {
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) gGame.markedCount--

    gGame.shownCount++
    gBoard[i][j].isMarked = false
    gBoard[i][j].isShown = true
    renderCell(i, j)
}

function renderStats() {
    document.querySelector('.lives-count').innerHTML = gGame.LIVES
}

function onReset(level) {
    level = level ? level : gLevel.SIZE
    gUndo.isActive = false

    clearInterval(gTimer.interval)
    document.querySelector('.game-time').innerHTML = 0

    onInit(level)
}

function onMouseMove(event) {
    updateAreaSelect(event.target) // mega-hint handler
}

function startGame(i, j) {
    gGame.isOn = true
    gFirstMoveCoord = { i, j }
    setMines(gBoard)

    var elBtns = document.querySelectorAll('.btn-off')
    for (var i = 0; i < elBtns.length; i++) {
        elBtns[i].classList.remove('btn-off')
        elBtns[i].classList.add('btn-on')
    }

    document.querySelector('.btn-editor').classList.remove('btn-on')
    document.querySelector('.btn-editor').classList.add('btn-off')

}
