var gUndo

function onUndo() {
    if (!gGame.isOn) return

    gUndo.isActive = true
    // restores board state to last move
    onInit(gLevel.SIZE, true)

    gBoard = _.cloneDeep(gUndo.backupBoard)
    renderBoard(gBoard)

    if (gUndo.moveQueue.length === 1) {
        onReset(gLevel.SIZE)
        return
    }

    var moves = _.cloneDeep(gUndo.moveQueue)
    moves.pop()
    setUndo()

    for (var i = 0; i < moves.length; i++) {
        var coord = moves[i]
        onCellClicked(coord.i, coord.j)
    }

    gUndo.isActive = false
}