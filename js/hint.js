
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