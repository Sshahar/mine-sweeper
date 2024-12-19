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

    setTimeout(hideSafeClick, 1000, cell)

    document.querySelector('.safe-click-count').innerHTML = gGame.safeClickCount
}

function hideSafeClick(cell) {
    gBoard[cell.i][cell.j].isSafe = false
    renderCell(cell.i, cell.j)

    var elCell = getElCell(cell)
    if (!gBoard[cell.i][cell.j].isShown) elCell.classList.add('hidden-cell')
}