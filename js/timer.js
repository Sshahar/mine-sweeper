var gTimer

function setTimer() {
    gTimer = {}
}

function startTimer() {
    gTimer.start = new Date().getTime()
    
    gTimer.interval = setInterval(updateTime, 1)
}

function updateTime() {
    if (!gTimer.start) return
    var currTime = new Date().getTime()
    var timeMs = currTime - gTimer.start
    document.querySelector('.game-time').innerHTML = (timeMs / 1000.0).toFixed(3)
}