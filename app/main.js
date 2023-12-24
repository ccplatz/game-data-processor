'use strict';

const processBtn = document.getElementById('processBtn');
const outputElem = document.getElementById('output');
const inputElem = document.getElementById('input');
const htmlListElem = document.getElementById('htmlList');
const devideHomeAndAwayElem = document.getElementById('devideHomeAndAway');
const showDateElem = document.getElementById('showDates');

class App {
    #games;
    #mappings = {
        'M-ML': '1. Herren',
        'F-': '1. Damen',
        'M-2KK-1': '2. Herren',
        wA: 'Weibliche A-Jugend',
        wC: 'Weibliche C-Jugend',
        wD: 'Weibliche D-Jugend',
        wE: 'Weibliche E-Jugend',
        mA: 'Männliche A-Jugend',
        mC: 'Männliche C-Jugend',
        mD: 'Männliche D-Jugend',
        mE: 'Männliche E-Jugend',
    };

    constructor() {
        processBtn.addEventListener('click', this.#processInput.bind(this));
    }

    #processInput() {
        this.#emptyOutputField();
        const linesArr = this.#getUserInputAsArray();
        this.#games = this.#processLines(linesArr);
        let outputText = this.#renderOutput();
        this.#showOutput(outputText);
    }

    #emptyOutputField() {
        outputElem.value = '';
    }

    #getUserInputAsArray() {
        const inputText = inputElem.value;
        return inputText.split('\n');
    }

    #processLines(linesArr) {
        const homeGames = [];
        const awayGames = [];
        const allGames = [];

        const isHomeGame = (game) => game.type === 'home';

        // Split every line by the tab symbol
        let gameDataArr = linesArr.map((line) => line.split('\t'));

        // Skip if no game ID exists
        gameDataArr = gameDataArr.filter((line) => {
            return line[1];
        });

        // Copy team description from previous line if team has more than one game per week
        gameDataArr = this.#setTeamDescriptions(gameDataArr);

        gameDataArr.forEach((lineArr) => {
            const game = this.#getNewGame(lineArr);

            if (isHomeGame(game)) {
                homeGames.push(game);
            }

            if (!isHomeGame(game)) {
                awayGames.push(game);
            }

            allGames.push(game);
        });

        // Sort games by date
        const gamesArr = [homeGames, awayGames, allGames].map((gameArr) =>
            gameArr.sort((a, b) => a.date - b.date)
        );

        return gamesArr;
    }

    #setTeamDescriptions(gameDataArr) {
        gameDataArr.map((line, key) => {
            if (line[0] === '' && !(line[0] in this.#mappings)) {
                line[0] = gameDataArr[key - 1][0];
            }
        });
        return gameDataArr;
    }

    #getNewGame(lineArr) {
        const rawTeam = lineArr[0].trim();
        const team = this.#mapTeamDescription(rawTeam);

        const rawDate = lineArr[2];
        const date = this.#getDateObjectFromString(rawDate);

        const home = lineArr[4].trim();
        const guest = lineArr[5].trim();
        const result = lineArr[6].trim();

        const game = new Game(team, date, home, guest, result);

        return game;
    }

    #mapTeamDescription(rawTeam) {
        let team = '';
        Object.entries(this.#mappings).forEach(([key, value]) => {
            if (rawTeam.includes(key)) {
                team = value;
            }
        });

        return team;
    }

    #getDateObjectFromString(dateString) {
        dateString = dateString.replace('h', '');
        const [, datePart, time] = dateString.split(', ');
        const [day, month, yearShort] = datePart.split('.');
        const year = '20' + yearShort;
        if (time) {
            const [parsedHour, parsedMinute] = time.split(':');
            const hour = parseInt(parsedHour);
            const minute = parseInt(parsedMinute);
            return new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hour),
                parseInt(minute)
            );
        }

        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    #renderOutput() {
        const asHtmlList = () => htmlListElem.checked;

        const output = asHtmlList()
            ? this.#getHtmlOutput(...this.#games)
            : this.#getTextFromGames(...this.#games);

        return output;
    }

    #getTextFromGames(homeGames, awayGames, allGames) {
        let text = 'Hier die Übersicht der Spiele:\n\n';

        if (this.#devideHomeAndAway()) {
            text += 'Heimspiele:\n';
            text +=
                homeGames
                    .map((game) => game.getGameString(this.#withDate()))
                    .join('\n') + '\n\n';
            text += 'Auswärtsspiele:\n';
            text += awayGames
                .map((game) => game.getGameString(this.#withDate()))
                .join('\n');

            return text;
        }

        text = allGames
            .map((game) => game.getGameString(this.#withDate()))
            .join('\n');

        return text;
    }

    #devideHomeAndAway() {
        return devideHomeAndAwayElem.checked;
    }

    #withDate() {
        return showDateElem.checked;
    }

    #getHtmlOutput(homeGames, awayGames, allGames) {
        let htmlText = '<strong>Hier die Übersicht der Spiele:</strong>\n\n';

        if (this.#devideHomeAndAway()) {
            htmlText += 'Heimspiele:\n';
            htmlText += this.#getListFromGames(homeGames) + '\n&nbsp;\n\n';
            htmlText += 'Auswärtsspiele:\n';
            htmlText += this.#getListFromGames(awayGames) + '\n';

            return htmlText;
        }

        htmlText = this.#getListFromGames(allGames);

        return htmlText;
    }

    #getListFromGames(games) {
        let htmlText = '<ul>\n';
        games.forEach(
            (game) =>
                (htmlText += `<li>${game.getGameString(
                    this.#withDate()
                )}</li>\n`)
        );
        htmlText += '</ul>';

        return htmlText;
    }

    #showOutput(output) {
        outputElem.value = output;
    }
}

class Game {
    constructor(team, date, home, guest, result) {
        this.team = team;
        this.date = date;
        this.home = home;
        this.guest = guest;
        this.result = result;
        this.#setGameType();
        this.#setSgsTeam();
    }

    get dateString() {
        const hour = this.date.getHours();
        const minute = this.date.getMinutes();

        if (hour === 0 && minute === 0) {
            return new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(this.date);
        }

        return new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(this.date);
    }

    #setGameType() {
        if (this.home.search(/Sendenhorst/i) > -1) {
            this.type = 'home';
        } else {
            this.type = 'away';
        }
    }

    #setSgsTeam(gameDataObject) {
        if (this.home.search(/Sendenhorst/i) > -1) {
            this.home = 'SGS';
        } else {
            this.guest = 'SGS';
        }
    }

    getGameString(withDate = true) {
        let gameString = '';
        const date = withDate ? this.dateString + ', ' : '';
        gameString = `${this.team}: ${date}${this.home} gg. ${this.guest}`;
        if (this.result !== ':') {
            gameString += `, ${this.result}`;
        }

        return gameString;
    }
}

const app = new App();
