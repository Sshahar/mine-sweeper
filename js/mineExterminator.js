
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

function getMineCells() {
    var cells = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) cells.push({ i, j })
        }
    }

    return cells
}