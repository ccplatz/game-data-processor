'use strict';

const processBtn = document.getElementById('processBtn');
const outputElem = document.getElementById('output');
const inputElem = document.getElementById('input');
const htmlListElem = document.getElementById('htmlList');
const mappings = {
    'M-ML': '1. Herren',
    'F-KK-1': '1. Damen',
    'M-2KK-1': '2. Herren',
    'wA-MK': 'weibliche A-Jugend',
    'wC-MK2': 'weibliche C-Jugend',
    'wD-ML2': 'weibliche D-Jugend',
    'wE-ML4': 'weibliche E-Jugend',
    'mA ML VR': 'männliche A-Jugend',
    'mC-MK2': 'männliche C-Jugend',
    'mD-MK3': 'männliche D-Jugend',
    'mE-ML4': 'männliche E-Jugend',
    'F-Freu': 'Freundschaftsspiele Damen',
};

const asHtmlList = () => htmlListElem.checked;
const emptyOutput = () => outputElem.value = '';
const showOutput = (output) => outputElem.value = output;
const buildGameDataObject = function (gameData) {
    return {
        'team': gameData[0],
        'id': gameData[1],
        'date': gameData[2],
        'home': gameData[4],
        'guest': gameData[5],
        'result': gameData[6]
    };
}
const mapTeamDescription = function (gameData) {
    let teamDescription = '';
    Object.entries(mappings).forEach(([key, value]) => {
        if (gameData.team == key) {
            teamDescription = value;
        }
    });

    return teamDescription;
}
const buildGameString = function (gameData) {
    let game = '';
    if (gameData.result == ':') {
        game = `${gameData.team}: ${gameData.date}, ${gameData.home} gg. ${gameData.guest}`;
    } else {
        game = `${gameData.team}: ${gameData.date}, ${gameData.home} gg. ${gameData.guest}, Ergebnis: ${gameData.result}`;
    }

    return game;
}
const processLines = function (lines) {
    const games = [];

    lines.forEach(line => {
        // split line by tabs
        const data = line.split('\t');

        const gameData = buildGameDataObject(data);

        // skip if no game ID exists
        if (gameData.id == undefined || gameData.id == '') {
            return;
        }

        gameData.team = mapTeamDescription(gameData);

        // replace home or guest with team description
        if (gameData.home.search(/Sendenhorst/i) > 0) {
            gameData.home = gameData.team;
        } else {
            gameData.guest = gameData.team;
        }

        const game = buildGameString(gameData);

        games.push(game);
    });

    return games;
}
const getListFromGames = function (games) {
    let htmlText = "<ul>";
    games.forEach((game) => htmlText += `<li>${game}</li>`);
    htmlText += "</ul>";

    return htmlText;
}

processBtn.addEventListener('click', function (event) {
    emptyOutput();
    const inputText = inputElem.value;
    const linesArr = inputText.split('\n');
    const games = processLines(linesArr);
    let outputText = '';
    if (asHtmlList()) {
        outputText = getListFromGames(games);
    } else {
        outputText = games.join('\n');
    }

    showOutput(outputText);
})