'use strict'

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min))
}

function getRandomColor() {
    const letters = '0123456789ABCDEF'
    var color = '#'

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function sum(arr) {
    var arrSum = 0
    for (var i = 0; i < arr.length; i++) {
        arrSum += arr[i]
    }
    return arrSum
}

async function sleep(ms = 1000) {
    await new Promise(r => setTimeout(r, ms))
}

function distance(coord1, coord2) {
    // taxicab distance
    return Math.abs(coord1.i - coord2.i) + Math.abs(coord1.j - coord2.j)
}

function inRange(num, low, high) {
    return num >= low && num < high
}

function getFuncName() {
    return getFuncName.caller.name
}

function getEmptyCells(SIZE, board) {
    var emptyCells = []

    for (var i = 0; i < SIZE; i++) {
        for (var j = 0; j < SIZE; j++) {
            if (gFirstMoveCoord.i === i && gFirstMoveCoord.j === j) continue
            if (!board[i][j].isMine && !board[i][j].isShown) emptyCells.push({ i, j })
        }
    }

    return emptyCells
}

function getElCell(coord) {
    return document.querySelector(`td[data-i="${coord.i}"][data-j="${coord.j}"]`)
}

function getCellCoord(elCell) {
    return {i: +elCell.getAttribute('data-i'), j: +elCell.getAttribute('data-j')}
}

function getCellContent(i, j) {
    if (gBoard[i][j].isMarked) return MARK
    if (gBoard[i][j].isMine) return MINE
    if (gBoard[i][j].isSafe) return SAFE
    return gBoard[i][j].minesAroundCount
}