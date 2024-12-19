var gMegaHint

function setMegaHint() {
    gMegaHint = {
        canMegaHint: true,
        state: -1,
        isMegaHint: false,
    }
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