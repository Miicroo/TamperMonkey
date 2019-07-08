// ==UserScript==
// @name         Temadagar
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/temadagar
// @version      1.0
// @description  Temadagar kalender
// @author       Magnus Larsson
// @match        https://temadagar.se/kalender/
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

domReady(function() {
    const container = getContainer();
    const themeDays = parse(container);
    const downloadData = {
        themeDays: themeDays,
        attribution: {
            description: 'Data provided by https://temadagar.se. For full calendar, see https://temadagar.se/kop-temadagar-kalender/',
            link: 'https://temadagar.se/kop-temadagar-kalender/'
        }
    };
    const downloadContainer = createDownloadLink(downloadData);

    container.insertBefore(downloadContainer, container.childNodes[0]);
});

function getContainer() {
    const childNodes = document.querySelector('div.content').children;

    for (let i = 0; i<childNodes.length; i++) {
        if (childNodes[i].innerText === `Temadagar ${getYear()}`) {
            return childNodes[i+1];
        }
    }
}

function getYear() {
    return (new Date()).getFullYear();
}

function parse(container) {
    const firstDataNodeIndex = getIndexOfFirstNodeWithData(container);

    const themeDays = {};
    let currentThemeDay = null;
    for (let i = firstDataNodeIndex; i<container.childNodes.length; i++) {
        const node = container.childNodes[i];

        if (node.nodeName === 'B') {
            currentThemeDay = new Date(`${dateFromSwedishDate(node.innerText)} ${getYear()}`).yyyymmdd().replace(/-/g, '');
            themeDays[currentThemeDay] = [];
        } else if (node.nodeName === '#text') {
            const eventName = node.textContent.replace('*', '').trim();
            if (eventName.length > 0) {
                themeDays[currentThemeDay].push({event: eventName});
            }
        } else if (node.nodeName === 'A') {
            themeDays[currentThemeDay].push({event: node.innerText, link: node.href});
        }
    }

    return themeDays;
}

function dateFromSwedishDate(dateMonthStr) {
    const monthTranslation = {
        Januari: 'jan',
        Februari: 'feb',
        Mars: 'mar',
        April: 'apr',
        Maj: 'may',
        Juni: 'jun',
        Juli: 'jul',
        Augusti: 'aug',
        September: 'sept',
        Oktober: 'oct',
        November: 'nov',
        December: 'dec'
    };
    const dateMonth = dateMonthStr.split(' ');
    return `${dateMonth[0]} ${monthTranslation[dateMonth[1]]}`;
}

function getIndexOfFirstNodeWithData(container) {
    let shouldParseData = false;

    for (let i = 0; i<container.childNodes.length; i++) {
        const node = container.childNodes[i];
        if (shouldParseData) {
            if (node.nodeName === 'B') {
                return i;
            }
        } else {
            // Skip first <b>, it just tells us how many there are in total
            shouldParseData = node.nodeName === 'B';
        }
    }
}

function createDownloadLink(data) {
    const downloadLink = document.createElement('a');
    downloadLink.innerText = 'Download';
    downloadLink.onclick = () => download(JSON.stringify(data), 'specialThemes.json');

    const downloadContainer = document.createElement('div');
    downloadContainer.appendChild(downloadLink);

    return downloadContainer;
}
