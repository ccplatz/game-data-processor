'use strict';

const processBtn = document.getElementById('processBtn');
const outputElem = document.getElementById('output');
const inputElem = document.getElementById('input');
const htmlListElem = document.getElementById('htmlList');
const devideHomeAndAwayElem = document.getElementById('devideHomeAndAway');
const showDateElem = document.getElementById('showDates');
const mappings = {
    'M-ML': '1. Herren',
    'F-KK-1': '1. Damen',
    'M-2KK-1': '2. Herren',
    'wA-MK': 'Weibliche A-Jugend',
    'wC-MK2': 'Weibliche C-Jugend',
    'wD-ML2': 'Weibliche D-Jugend',
    'wE-ML4': 'Weibliche E-Jugend',
    'mA ML VR': 'Männliche A-Jugend',
    'mC-MK2': 'Männliche C-Jugend',
    'mD-MK3': 'Männliche D-Jugend',
    'mE-ML4': 'Männliche E-Jugend',
    'F-Freu': 'Freundschaftsspiele Damen',
};

const asHtmlList = () => htmlListElem.checked;
const withDate = () => showDateElem.checked;
const devideHomeAndAway = () => devideHomeAndAwayElem.checked;
const emptyOutput = () => (outputElem.value = '');
const showOutput = (output) => (outputElem.value = output);
const buildGameDataObject = function (gameData) {
    return {
        team: gameData[0],
        id: gameData[1],
        date: gameData[2],
        home: gameData[4],
        guest: gameData[5],
        result: gameData[6],
    };
};

const mapTeamDescription = function (gameData) {
    let teamDescription = '';
    Object.entries(mappings).forEach(([key, value]) => {
        if (gameData.team == key) {
            teamDescription = value;
        }
    });

    return teamDescription;
};

const buildGameString = function (gameData) {
    let game = '';
    const date = withDate() ? gameData.date + ', ' : '';
    if (gameData.result === ':') {
        game = `${gameData.team}: ${date}${gameData.home} gg. ${gameData.guest}`;
    } else {
        game = `${gameData.team}: ${date}${gameData.home} gg. ${gameData.guest}, ${gameData.result}`;
    }

    return game;
};

const processLines = function (lines) {
    const homeGames = [];
    const awayGames = [];
    const allGames = [];

    lines.forEach((line) => {
        // split line by tabs
        const data = line.split('\t');

        const gameData = buildGameDataObject(data);

        // skip if no game ID exists
        if (!gameData.id) {
            return;
        }

        gameData.team = mapTeamDescription(gameData);
        gameData.date = gameData.date.replace('h', '');

        // replace home or guest with team description
        // flag as home or away game
        if (gameData.home.search(/Sendenhorst/i) > -1) {
            gameData.home = 'SGS';
            gameData.type = 'home';
        } else {
            gameData.guest = 'SGS';
            gameData.type = 'away';
        }

        const game = buildGameString(gameData);

        if (gameData.type === 'home') {
            homeGames.push(game);
        } else {
            awayGames.push(game);
        }
        allGames.push(game);
    });

    const games = [homeGames, awayGames, allGames];

    return games;
};

const getListFromGames = function (games) {
    let htmlText = '<ul>';
    games.forEach((game) => (htmlText += `<li>${game}</li>`));
    htmlText += '</ul>';

    return htmlText;
};

const getTextFromGames = function (homeGames, awayGames, allGames) {
    let text = '';

    if (devideHomeAndAway()) {
        text = 'Heimspiele:\n';
        text += homeGames.join('\n') + '\n\n';
        text += 'Auswärtsspiele:\n';
        text += awayGames.join('\n');

        return text;
    }

    text = allGames.join('\n');

    return text;
};

const getHtmlOutput = function (homeGames, awayGames, allGames) {
    let htmlText = '';

    if (devideHomeAndAway()) {
        htmlText = 'Heimspiele:\n';
        htmlText += getListFromGames(homeGames) + '\n\n';
        htmlText += 'Auswärtsspiele:\n';
        htmlText += getListFromGames(awayGames) + '\n';

        return htmlText;
    }

    htmlText = getListFromGames(allGames);

    return htmlText;
};

processBtn.addEventListener('click', function (event) {
    emptyOutput();
    const inputText = inputElem.value;
    const linesArr = inputText.split('\n');
    const games = processLines(linesArr);
    let outputText = asHtmlList()
        ? getHtmlOutput(...games)
        : getTextFromGames(...games);
    showOutput(outputText);
});
