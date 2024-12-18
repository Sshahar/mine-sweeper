'use strict'

// TODO: fix UNDO reset safeClickCount: 3, canMineExterminator: true,

var gBoard
var gLevel
var gGame
var gFirstMoveCoord
var gTimer
var gLeaderboard
var gMoveQueue
var gBackupBoard
var gIsUndo
var gMegaHint

var MINE = '<img src="img/mine.png">'
var MARK = '<img src="img/mark.png">'
var SAFE = '🏳️'
var LOSE = '🤯'
var WIN = '😎'
var ONGOING = '😄'

function onInit(level = 4, isUndo) {
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
        gIsUndo = false
    }
    // setStorage()
    // populateLeaderboardForTesting()
}

function setLevel(level) {
    switch (level) {
        case 4:
            gLevel = {
                NAME: 'easy',
                SIZE: 4,
                MINES: 2
            }
            break
        case 8:
            gLevel = {
                NAME: 'medium',
                SIZE: 8,
                MINES: 14
            }
            break
        case 12:
            gLevel = {
                NAME: 'expert',
                SIZE: 12,
                MINES: 32
            }
    }
}

function setHints() {
    var elHints = document.querySelectorAll('.highlight-hint')

    for (var i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('highlight-hint')
    }
}

function setGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        LIVES: 5,
        isEditorMode: false,
        safeClickCount: 3,
        canMineExterminator: true,
        canMegaHint: true,
    }
    renderStats()
    document.querySelector('.game-state').innerHTML = ONGOING
}

function setTimer() {
    gTimer = {}
}

function setUndo() {
    gMoveQueue = []
}

function setMegaHint() {
    gMegaHint = {
        canMegaHint: true,
        state: -1,
        isMegaHint: false,
    }
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
    board[0][0].isMine = true
    board[2][2].isMine = true

    // var emptyCells = getEmptyCells(gLevel.SIZE, board)
    // for (var mineCnt = gLevel.MINES; mineCnt > 0; mineCnt--) {
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
            renderCell(i, j)
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
            strHTML += `<td class="${classNames}" onclick="onCellClicked(${i}, ${j})" ` +
                `oncontextmenu="onCellMarked(${i}, ${j})"` +
                `data-i="${i}" data-j="${j}">` +
                `${cellContent}` +
                `</td>`
        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>'
    document.querySelector('section.game-container').innerHTML = strHTML
}

function renderCell(i, j) {
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked && !gGame.isHint && !gBoard[i][j].isSafe) return
    var elCell = document.querySelector(`td[data-i="${i}"][data-j="${j}"]`)
    elCell.innerHTML = getCellContent(i, j)
    elCell.classList.remove('hidden-cell')
}

function onCellClicked(i, j) {
    if (!gGame.isOn && !gGame.isEditorMode && !gGame.shownCount) {
        gGame.isOn = true
        gFirstMoveCoord = { i, j }
        setMines(gBoard)
        if (!gIsUndo) startTimer()
        gBackupBoard = _.cloneDeep(gBoard)
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

    gMoveQueue.push({ i, j })

    showCell(i, j)

    // is empty cell?
    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) {
        showNegs(i, j)
    }

    // mine or last cell?
    checkGameOver(i, j)
}

function revealHint(coord, revealMs = 1000) {
    var peekCells = [coord].concat(getNegs(coord))

    for (var n = 0; n < peekCells.length; n++) {
        var cell = peekCells[n]
        gBoard[cell.i][cell.j].isMarked = false
        renderCell(cell.i, cell.j)
    }
    setTimeout(hideCells, revealMs, peekCells)
}

function hideCells(cells) {
    for (var n = 0; n < cells.length; n++) {
        var cell = cells[n]
        var elCell = getElCell(cell)
        if (!gBoard[cell.i][cell.j].isShown) elCell.classList.add('hidden-cell')
    }
    gGame.isHint = false
}

function getElCell(coord) {
    return document.querySelector(`td[data-i="${coord.i}"][data-j="${coord.j}"]`)
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
        }
        return
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

function getCellContent(i, j) {
    if (gBoard[i][j].isMarked) return MARK
    if (gBoard[i][j].isMine) return MINE
    if (gBoard[i][j].isSafe) return SAFE
    return gBoard[i][j].minesAroundCount
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

function onChangeLevel(level) {
    onReset(level)
    renderLeaderboard()
}

function showNegs(i, j) {
    var negs = getNegs({ i, j })

    for (var n = 0; n < negs.length; n++) {
        var coord = negs[n]
        var shouldFlipNeg = !gBoard[coord.i][coord.j].isShown
        showCell(coord.i, coord.j)
        if (!gBoard[coord.i][coord.j].minesAroundCount &&
            shouldFlipNeg) showNegs(coord.i, coord.j)
    }
}

function showCell(i, j) {
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
    gIsUndo = false

    clearInterval(gTimer.interval)
    document.querySelector('.game-time').innerHTML = 0

    onInit(level)
}

function onHintClicked(elHint) {
    // TODO: use Model instead of DOM
    if (elHint.classList.contains('highlight-hint')) return
    if (!gGame.isOn) return // disable hints on first turn 

    gGame.isHint = true
    elHint.classList.add('highlight-hint')
}

function setStorage() {
    if (typeof (Storage) === "undefined") return

    localStorage.setItem('easyLeaderboard', JSON.stringify(gLeaderboard.easy))
    localStorage.setItem('mediumLeaderboard', JSON.stringify(gLeaderboard.medium))
    localStorage.setItem('expertLeaderboard', JSON.stringify(gLeaderboard.expert))
}

function getStorage() {
    if (typeof (Storage) === "undefined") return
    var easy = typeof localStorage.easyLeaderboard === 'undefined' ? [] : JSON.parse(localStorage.easyLeaderboard)
    var medium = typeof localStorage.mediumLeaderboard === 'undefined' ? [] : JSON.parse(localStorage.mediumLeaderboard)
    var expert = typeof localStorage.expertLeaderboard === 'undefined' ? [] : JSON.parse(localStorage.expertLeaderboard)
    gLeaderboard.easy = easy
    gLeaderboard.medium = medium
    gLeaderboard.expert = expert
}

function setLeaderboard() {
    gLeaderboard = {}
    getStorage()
    renderLeaderboard()
}

function addLeaderboard() {
    var username = document.querySelector('.username').value
    var score = +document.querySelector('.game-time').innerHTML

    if (!username) return // don't add user with no name to leaderboard

    gLeaderboard[`${gLevel.NAME}`].push({ username, score })
    localStorage.setItem(`${gLevel.NAME}Leaderboard`, JSON.stringify(`gLeaderboard.${gLevel.NAME}`))
}

function renderLeaderboard() {
    var strHTML = ''

    // sort leaderboard by score
    var leaderboard = gLeaderboard[`${gLevel.NAME}`]
    leaderboard.sort((a, b) => {
        return a.score - b.score
    })


    for (var i = 0; i < leaderboard.length; i++) {
        var name = leaderboard[i].username
        var score = leaderboard[i].score

        strHTML += `<tr>
        <td>${name}</td>
        <td>${score}</td>
        </tr>`
    }

    document.querySelector('.leaderboard').innerHTML = strHTML
}

function populateLeaderboardForTesting() {
    gLeaderboard = {
        easy: [
            { username: 'john', score: 3 },
            { username: 'joe', score: 4.5 },

        ],
        medium: [{ username: 'john', score: 3 }],
        expert: [{ username: 'john', score: 3 }],

    }
    setStorage()
}

function onEditorMode(i, j) {
    gBoard[i][j].isMine = true
}

function onEditorClick(elBtn) {
    gGame.isEditorMode = !gGame.isEditorMode
    elBtn.classList.toggle('edit-mode')
}

function onUndo() {
    if (!gGame.isOn) return
    gIsUndo = true
    // restores board state to last move
    onInit(gLevel.SIZE, true)

    gBoard = _.cloneDeep(gBackupBoard)
    renderBoard(gBoard)

    if (gMoveQueue.length === 1) {
        onReset(gLevel.SIZE)
        return
    }

    var moves = _.cloneDeep(gMoveQueue)
    moves.pop()
    setUndo()

    for (var i = 0; i < moves.length; i++) {
        var coord = moves[i]
        onCellClicked(coord.i, coord.j)
    }

    gIsUndo = false
}

function onDarkModeToggle() {
    document.body.classList.toggle('dark-mode')
}

function onSafeClick() {
    if (!gGame.isOn) return
    if (gGame.safeClickCount <= 0) return
    --gGame.safeClickCount

    // Get random cell
    var emptyCells = getEmptyCells(gLevel.SIZE, gBoard)
    var rndIdx = getRandomInt(0, emptyCells.length)
    var cell = emptyCells[rndIdx]

    gBoard[cell.i][cell.j].isSafe = true
    renderCell(cell.i, cell.j)

    setTimeout(() => {
        gBoard[cell.i][cell.j].isSafe = false
        renderCell(cell.i, cell.j)

        var elCell = getElCell(cell)
        if (!gBoard[cell.i][cell.j].isShown) elCell.classList.add('hidden-cell')
    }, 1000, cell)

    document.querySelector('.safe-click-count').innerHTML = gGame.safeClickCount
}

function getMineCells() {
    var cells = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) cells.push({ i, j })
        }
    }

    return cells
}

function onMineExterminator() {
    if (!gGame.isOn) return
    if (!gGame.canMineExterminator) return

    var mineCells = getMineCells()

    for (var totalExterms = 3; totalExterms > 0 && mineCells.length; totalExterms--) {
        var rndIdx = getRandomInt(0, mineCells.length)
        var cell = mineCells.splice(rndIdx, 1)[0]


        gBoard[cell.i][cell.j].isMine = false
    }

    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

    gGame.canMineExterminator = false
}

function onMegaHint() {
    if (!gMegaHint.canMegaHint) return
    gMegaHint.state = 0
    gMegaHint.canMegaHint = false
    gMegaHint.isMegaHint = true
}


function handleMegaHint(i, j) {
    if (gMegaHint.state === 0) { // select top left corner
        gMegaHint.coord1 = { i, j }
    } else if (gMegaHint.state === 1) { // select bot right corner
        gMegaHint.coord2 = { i, j }
        
        // show area for a few seconds
        var cells = getCellsInArea(gMegaHint.coord1, gMegaHint.coord2)
        showCells(cells, 2000)
        gMegaHint.isMegaHint = false
    }

    gMegaHint.state++
}

function showCells(cells, revealMs) {
    gGame.isHint = true
    for (var n = 0; n < cells.length; n++) {
        var cell = cells[n]
        gBoard[cell.i][cell.j].isMarked = false
        renderCell(cell.i, cell.j)
    }
    setTimeout(hideCells, revealMs, cells)
}