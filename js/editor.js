function onEditorMode(i, j) {
    gBoard[i][j].isMine = true
}

function onEditorClick(elBtn) {
    gGame.isEditorMode = !gGame.isEditorMode
    elBtn.classList.toggle('edit-mode')
}
