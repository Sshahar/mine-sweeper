
function setHints() {
    var elHints = document.querySelectorAll('.highlight-hint')

    for (var i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('highlight-hint')
    }
}

function onHintClicked(elHint) {
    // TODO: use Model instead of DOM
    if (elHint.classList.contains('highlight-hint')) return
    if (!gGame.isOn) return // disable hints on first turn 

    gGame.isHint = true
    elHint.classList.add('highlight-hint')
}

function revealHint(coord, revealMs = 1000) {
    var peekCells = [coord].concat(getNegs(coord))
    timedRender(peekCells, 'isHint', revealMs)
}

function timedRender(cells, flag, revealMs) {
    // Set cells to hint
    setCellsFlag(flag, true, cells)

    // render cells
    renderCells(cells)

    setTimeout(() => {
        setCellsFlag(flag, false, cells)
        renderCells(cells)
        gGame.isHint = false    // TODO: remove this variable
    }, revealMs, cells)
}

function setCellsFlag(flag, value, cells) {
    // Set cells to hint
    for (var n = 0; n < cells.length; n++) {
        var cell = cells[n]
        gBoard[cell.i][cell.j][flag] = value
    }
}

function renderCells(cells) {
    for (var n = 0; n < cells.length; n++) {
        var cell = cells[n]
        renderCell(cell.i, cell.j)
    }
}

function hideCells(cells) {
    for (var n = 0; n < cells.length; n++) {
        var cell = cells[n]
        var elCell = getElCell(cell)
        if (!gBoard[cell.i][cell.j].isShown) elCell.classList.add('hidden-cell')
    }
}