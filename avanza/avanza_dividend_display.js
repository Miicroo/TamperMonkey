// ==UserScript==
// @name         Avanza dividend display
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/avanza
// @version      1.0.0
// @description  Shows the dvidend percent current year
// @author       Miicroo
// @match        https://www.avanza.se/aktier/om-aktien.html/**
// @grant        none
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

domReady(function() {
    main();
});

function main() {
    const container = getContainerToAddUiTo();
    const ui = buildUi(getDividendPercent());
    container.appendChild(ui);
}

function getContainerToAddUiTo() {
    return document.querySelector('.oneYearDevelop')
        .parentElement
        .parentElement;
}

function getDividendPercent() {
    const percent = getDividendThisYear() / getLowestPriceToday() * 100;
    return Math.round(percent * 100) / 100;
}

function getLowestPriceToday() {
    const priceText = document.querySelector('.lowestPrice').innerText.replace(',', '.');
    return parseFloat(priceText);
}

function getDividendThisYear() {
	const allDividendEvents = Array.from(
		document.querySelector('[data-component_type="company_events"]')
			.querySelector('tbody')
			.querySelectorAll('tr')
	);

	const dividendEventsThisYear = allDividendEvents
        .map(tr => Array.from(tr.querySelectorAll('td')))
		.filter(arr => arr[2].innerText.indexOf(`${getCurrentYear()}-`) === 0);

	const dividendsThisYear = dividendEventsThisYear
        .map(arr => arr[1].innerText.split(" "));

    const dividendSum = dividendsThisYear
        .map(arr => arr[0].replace(',', '.'))
        .map(amount => parseFloat(amount))
        .reduce((a, b) => a + b, 0);

	return dividendSum;
}

function getCurrentYear() {
    return new Date().getFullYear();
}

function buildUi(dividend) {
    const container = document.createElement('div');
    container.classList.add('standardDivider');
    container.classList.add('tableV2');

    const header = document.createElement('div');
    header.classList.add('componentToolbar');
    header.classList.add('clearFix');
    header.classList.add('relative');
    header.classList.add('tableV2');
    header.setAttribute('role', 'toolbar');

    const headerText = document.createElement('h2');
    headerText.innerText = `Utdelning ${getCurrentYear()}`;
    headerText.classList.add('fLeft');
    headerText.classList.add('upperCase');

    header.appendChild(headerText);

    const body = document.createElement('div');
    body.classList.add('clearFix');
    body.style.padding = '8px 0px';
    body.innerText = `${dividend} %`;

    container.appendChild(header);
    container.appendChild(body);

    return container;
}
