var gMegaHint

function setMegaHint() {
    gMegaHint = {
        canMegaHint: true,
        state: -1,
        isMegaHint: false,
    }
}

function onMegaHint() {
    if (!gMegaHint.canMegaHint || !gGame.isOn) return
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
        indicateArea(false)
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

function updateAreaSelect(elCell) {
    if (elCell.nodeName !== 'TD') return
    if (!(gMegaHint.state === 1 || gMegaHint.state === 2)) return
    // only indicate hint on cells in second state

    gMegaHint.coord2 = getCellCoord(elCell)
    indicateArea(gMegaHint.state === 1)
}

function indicateArea(shouldIndicate) {
    var coord1 = gMegaHint.coord1
    var coord2 = gMegaHint.coord2

    // render cells
    var cells = getCellsInArea(coord1, coord2)
    
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i]
        var cellEl = getElCell(cell)
        var elCellContent = cellEl.firstChild

        if (shouldIndicate && !gBoard[cell.i][cell.j].isShown) { // add indicate
            cellEl.classList.add('mega-hint')
            elCellContent.classList.add('hidden-cell')
        } else { // remove indicate
            cellEl.classList.remove('mega-hint')
            elCellContent.classList.remove('hidden-cell')
        }
    }
}
