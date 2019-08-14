// ==UserScript==
// @name         Avanza stock
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/avanza
// @version      1.0
// @description  Creates configuration for HomeAssistant custom component avanza_stock
// @author       Magnus Larsson
// @match        https://www.avanza.se/aktier/**
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js
// ==/UserScript==


domReady(function() {
    getMainContainer().appendChild(modalStyling());
    getMainContainer().appendChild(createModal());
    insertModalOpener(modalOpener());

    const modalContainer = getModalContainer();
    modalContainer.appendChild(monitoredConditionsSelector());
    modalContainer.appendChild(createOutput());

    updateUi([]);
});

function getMainContainer() {
    return document.querySelector('#main');
}

function modalStyling() {
    const styling = document.createElement('link');
    styling.setAttribute('rel', 'stylesheet');
    styling.href = 'https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css';
    return styling;
}

function createModal() {
    const haModal = document.createElement('div');
    haModal.id = getModalId();
    haModal.classList.add('modal');

    const h2 = document.createElement('h2');
    h2.innerText = 'Avanza_stock config generator';

    const contentDiv = document.createElement('div');
    contentDiv.id = getModalContainerId();

    haModal.appendChild(h2);
    haModal.appendChild(contentDiv);

    return haModal;
}

function getModalId() {
    return 'haModal';
}

function getModalContainerId() {
    return 'haModal-content';
}

function modalOpener() {
    const opener = document.createElement('a');
    opener.href = `#${getModalId()}`;
    opener.setAttribute('rel', 'modal:open');
    opener.innerText = 'Configure avanza_stock';

    return opener;
}

function insertModalOpener(modalOpener) {
    const modalOpenerContainer = document.createElement('li');
    modalOpenerContainer.classList.add('tLeft');

    modalOpenerContainer.appendChild(document.createElement('br'));
    modalOpenerContainer.appendChild(modalOpener);

    const headerBar = document.querySelector('.quoteBar');
    headerBar.insertBefore(modalOpenerContainer, headerBar.children[headerBar.children.length-1]);
}

function getModalContainer() {
    return document.querySelector(`#${getModalContainerId()}`);
}

function monitoredConditionsSelector() {
    const monitoredConditions = ['change', 'changePercent', 'country', 'currency', 'description', 'directYield', 'dividends', 'flagCode', 'hasInvestmentFees', 'highestPrice', 'id', 'isin', 'lastPrice', 'lastPriceUpdated', 'loanFactor', 'lowestPrice', 'marketCapital', 'marketList', 'marketMakerExpected', 'marketPlace', 'marketTrades', 'morningStarFactSheetUrl', 'name', 'numberOfOwners', 'orderDepthReceivedTime', 'priceAtStartOfYear', 'priceEarningsRatio', 'priceFiveYearsAgo', 'priceOneMonthAgo', 'priceOneWeekAgo', 'priceOneYearAgo', 'priceSixMonthsAgo', 'priceThreeMonthsAgo', 'priceThreeYearsAgo', 'pushPermitted', 'quoteUpdated', 'sector', 'shortSellable', 'superLoan', 'tickerSymbol', 'totalNumberOfShares', 'totalValueTraded', 'totalVolumeTraded', 'tradable', 'volatility'];

    const selector = document.createElement('select');
    selector.multiple = 'multiple';
    monitoredConditions.forEach(condition => {
        const option = document.createElement('option');
        option.innerText = condition;
        selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(o => o.innerText);
        updateUi(selectedOptions);
    });

    return selector;
}

function createOutput() {
    const output = document.createElement('textarea');
    output.id = getOutputId();
    output.cols = '20';
    output.rows = '10';

    return output;
}

function getOutputId() {
    return 'haStockConfig';
}

function updateUi(monitoredConditions) {
    const stock = getStockData();

    const lineBreak = '\n';
    const monitoredConditionStr = monitoredConditions.length > 0 ?
          `monitored_conditions:${monitoredConditions.reduce((retVal, condition) => `${retVal}${lineBreak}    - ${condition}`, '')}` :
          '';

    const output = document.querySelector(`#${getOutputId()}`);
    output.innerHTML = `- platform: avanza_stock${lineBreak}  stock: ${stock.id}${lineBreak}  name: ${stock.name}${lineBreak}  shares: ${stock.shares}${lineBreak}  ${monitoredConditionStr}`;

    return output;
}

function getStockData() {
	const stockId = document.URL.split('/')[5];
	const name = document.querySelector('h1').innerText.trim();

	const hasShares = !!document.querySelector('[data-account_id]');
	const shares = hasShares ? document.querySelector('[data-account_id]').children[2].innerText : 0;

	return {
		'id': stockId,
	    'name': name,
	    'shares': shares,
	};
}
