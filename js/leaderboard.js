var gLeaderboard

function setLeaderboard() {
    gLeaderboard = {}
    getStorage()
    renderLeaderboard()
}

function setStorage() {
    if (typeof (Storage) === "undefined") return

    localStorage.setItem('easyLeaderboard', JSON.stringify(gLeaderboard.easy))
    localStorage.setItem('mediumLeaderboard', JSON.stringify(gLeaderboard.medium))
    localStorage.setItem('expertLeaderboard', JSON.stringify(gLeaderboard.expert))
}

function getStorage() {
    if (typeof (Storage) === "undefined") return
    var easy = typeof localStorage.easyLeaderboard === 'undefined' ? [] : JSON.parse(localStorage.easyLeaderboard)
    var medium = typeof localStorage.mediumLeaderboard === 'undefined' ? [] : JSON.parse(localStorage.mediumLeaderboard)
    var expert = typeof localStorage.expertLeaderboard === 'undefined' ? [] : JSON.parse(localStorage.expertLeaderboard)
    gLeaderboard.easy = easy
    gLeaderboard.medium = medium
    gLeaderboard.expert = expert
}

function addLeaderboard() {
    var username = document.querySelector('.username').value
    var score = +document.querySelector('.game-time').innerHTML

    if (!username) return // don't add user with no name to leaderboard

    gLeaderboard[`${gLevel.NAME}`].push({ username, score })
    localStorage.setItem(`${gLevel.NAME}Leaderboard`, JSON.stringify(`gLeaderboard.${gLevel.NAME}`))
}

function renderLeaderboard() {
    var strHTML = ''

    // sort leaderboard by score
    var leaderboard = gLeaderboard[`${gLevel.NAME}`]
    leaderboard.sort((a, b) => {
        return a.score - b.score
    })


    for (var i = 0; i < leaderboard.length; i++) {
        var name = leaderboard[i].username
        var score = leaderboard[i].score

        strHTML += `<tr>
        <td>${name}</td>
        <td>${score}</td>
        </tr>`
    }

    document.querySelector('.leaderboard').innerHTML = strHTML
}

function populateLeaderboardForTesting() {
    gLeaderboard = {
        easy: [
            { username: 'john', score: 3 },
            { username: 'joe', score: 4.5 },

        ],
        medium: [{ username: 'john', score: 3 }],
        expert: [{ username: 'john', score: 3 }],

    }
    setStorage()
}