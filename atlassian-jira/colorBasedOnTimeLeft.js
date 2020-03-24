// ==UserScript==
// @name         Jira color background based on time left
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/atlassian-jira
// @version      1.0.1
// @description  Changes the background color of your jira tasks based on remaining estimate % of board total.
// @author       Miicroo
// @match        **/secure/RapidBoard.jspa*
// @grant        none
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==



domReady(function() {
    setTimeout(main, 3500); // Wait until board is loaded
});

function main() {
    const timeLeft = getMaxTimeLeft();
    markTasks(timeLeft);
}


function getMaxTimeLeft() {
    return getTimeLeft(document)
        .map(s => getSeconds(s))
        .filter(seconds => seconds > 0)
        .reduce((a,b) => Math.max(a, b), 0);
}

function getTimeLeft(container) {
    return Array.from(container.querySelectorAll('aui-badge[title="Remaining Time Estimate"]'))
                .filter(x => !!x.innerText)
                .map(x => x.innerText);
}

function getSeconds(str) {
    let seconds = 0;
    const days = str.match(/(\d+)\s*d/);
    const hours = str.match(/(\d+)\s*h/);
    const minutes = str.match(/(\d+)\s*m/);

    if (days) {
        seconds += parseInt(days[1])*86400;
    }

    if (hours) {
        seconds += parseInt(hours[1])*3600;
    }

    if (minutes) {
        seconds += parseInt(minutes[1])*60;
    }

    return seconds;
}

function markTasks(maxTimeLeft) {
    document.querySelectorAll('.js-issue').forEach(issue => {
        const timeLeftContainer = issue.querySelector('aui-badge[title="Remaining Time Estimate"]');

        if (timeLeftContainer && timeLeftContainer.innerText) {
            const timeLeft = getSeconds(timeLeftContainer.innerText);

            if (timeLeft > 0) {
                issue.style.backgroundColor = getBgColor(timeLeft, maxTimeLeft);
            }
        }
    });
}

function getBgColor(timeLeft, totalTimeLeft) {
    const percentColors = [
        { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
        { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
        { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ];

    const pct = timeLeft / totalTimeLeft;

    let i = 1;
    for (; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    const lower = percentColors[i - 1];
    const upper = percentColors[i];
    const range = upper.pct - lower.pct;
    const rangePct = (pct - lower.pct) / range;
    const pctLower = 1 - rangePct;
    const pctUpper = rangePct;
    const color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };

    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
}
