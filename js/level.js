var gLevel

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

function onChangeLevel(level) {
    onReset(level)
    renderLeaderboard()
}