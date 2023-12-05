'use strict';

const processBtn = document.getElementById('processBtn');
const outputElem = document.getElementById('output');
const inputElem = document.getElementById('input');
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

const emptyOutput = () => outputElem.value = '';
const showOutput = (output) => outputElem.value = output;
const processLines = function (lines) {
    const games = [];

    lines.forEach(line => {
        // split line by tabs
        const data = line.split('\t');

        // build game data
        const gameData = {
            'team': data[0],
            'id': data[1],
            'date': data[2],
            'home': data[4],
            'guest': data[5],
            'result': data[6]
        };

        // continue if no game ID exists
        if (gameData.id == undefined || gameData.id == '') {
            return;
        }

        // map team description
        Object.entries(mappings).forEach(([key, value]) => {
            if (gameData.team == key) {
                gameData.team = value;
            }
        });

        // replace home or guest
        if (gameData.home.search(/Sendenhorst/i) > 0) {
            gameData.home = gameData.team;
        } else {
            gameData.guest = gameData.team;
        }

        // build game string
        let game = '';
        if (gameData.result == ':') {
            game = `${gameData.team}: ${gameData.date}, ${gameData.home} gg. ${gameData.guest}`;
        } else {
            game = `${gameData.team}: ${gameData.date}, ${gameData.home} gg. ${gameData.guest}, Ergebnis: ${gameData.result}`;
        }

        games.push(game);
    });

    return games;
}

processBtn.addEventListener('click', function (event) {
    emptyOutput();
    const inputText = inputElem.value;
    const linesArr = inputText.split('\n');
    const games = processLines(linesArr);
    const outputText = games.join('\n');

    showOutput(outputText);
})