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
        team: gameData[0].trim(),
        id: gameData[1],
        date: gameData[2],
        home: gameData[4],
        guest: gameData[5],
        result: gameData[6],
    };
};

const mapTeamDescription = function (gameDataObject) {
    let teamDescription = '';
    Object.entries(mappings).forEach(([key, value]) => {
        if (gameDataObject.team == key) {
            teamDescription = value;
        }
    });

    return teamDescription;
};

const getDateFromString = function (dateString) {
    dateString = dateString.replace('h', '');
    const [, datePart, time] = dateString.split(', ');
    const [day, month, yearShort] = datePart.split('.');
    const year = '20' + yearShort;
    const [hour, minute] = time.split(':');
    const parsedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
    );

    return parsedDate;
};

const getFormattedDateString = function (dateObject) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObject);
};

const buildGameString = function (gameDataObject) {
    let game = '';
    const date = withDate()
        ? getFormattedDateString(gameDataObject.date) + ', '
        : '';
    if (gameDataObject.result === ':') {
        game = `${gameDataObject.team}: ${date}${gameDataObject.home} gg. ${gameDataObject.guest}`;
    } else {
        game = `${gameDataObject.team}: ${date}${gameDataObject.home} gg. ${gameDataObject.guest}, ${gameDataObject.result}`;
    }

    return game;
};

const setTeamDescriptions = function (gameDataArr) {
    gameDataArr.map((line, key) => {
        if (line.length < 8 && !(line[0] in mappings)) {
            line.unshift(gameDataArr[key - 1][0]);
        }
    });
    return gameDataArr;
};

const setGameType = function (gameDataObject) {
    if (gameDataObject.home.search(/Sendenhorst/i) > -1) {
        gameDataObject.type = 'home';
    } else {
        gameDataObject.type = 'away';
    }
};

const setHomeAndGuest = function (gameDataObject) {
    if (gameDataObject.home.search(/Sendenhorst/i) > -1) {
        gameDataObject.home = 'SGS';
    } else {
        gameDataObject.guest = 'SGS';
    }
};

const processLines = function (linesArr) {
    const homeGames = [];
    const awayGames = [];
    const allGames = [];

    let gameDataArr = linesArr.map((line) => line.split('\t'));

    // Skip if no game ID exists
    gameDataArr = gameDataArr.filter((line) => {
        return line[1];
    });

    // Copy team description from previous line if team has more than one game per week
    gameDataArr = setTeamDescriptions(gameDataArr);

    gameDataArr.forEach((line) => {
        const gameDataObject = buildGameDataObject(line);

        gameDataObject.team = mapTeamDescription(gameDataObject);
        gameDataObject.date = getDateFromString(gameDataObject.date);
        setGameType(gameDataObject);
        setHomeAndGuest(gameDataObject);

        if (gameDataObject.type === 'home') {
            homeGames.push(gameDataObject);
        } else {
            awayGames.push(gameDataObject);
        }
        allGames.push(gameDataObject);
    });

    const processedGames = [homeGames, awayGames, allGames].map((gameArr) =>
        gameArr.sort((a, b) => a.date - b.date).map(buildGameString)
    );

    return processedGames;
};

const getListFromGames = function (games) {
    let htmlText = '<ul>';
    games.forEach((game) => (htmlText += `<li>${game}</li>`));
    htmlText += '</ul>';

    return htmlText;
};

const getTextFromGames = function (homeGames, awayGames, allGames) {
    let text = 'Hier die Übersicht der Spiele:\n\n';

    if (devideHomeAndAway()) {
        text += 'Heimspiele:\n';
        text += homeGames.join('\n') + '\n\n';
        text += 'Auswärtsspiele:\n';
        text += awayGames.join('\n');

        return text;
    }

    text = allGames.join('\n');

    return text;
};

const getHtmlOutput = function (homeGames, awayGames, allGames) {
    let htmlText = '<strong>Hier die Übersicht der Spiele:</strong>\n\n';

    if (devideHomeAndAway()) {
        htmlText += 'Heimspiele:\n';
        htmlText += getListFromGames(homeGames) + '\n&nbsp;\n\n';
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
