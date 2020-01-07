// ==UserScript==
// @name         LinkedIn contacts
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/linkedin
// @version      1.0
// @description  LinkedIn connections
// @author       Micro
// @match        https://www.linkedin.com/mynetwork/invite-connect/connections/
// @copyright    2018+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

function addUI() {
    const container = document.querySelector('.mn-connections__actions-container.ph5.pb3');
    const link = document.createElement('a');
    link.classList = 'mn-wylo-promo__action-button link-without-visited-state button-secondary-medium ember-view'.split(' ');
    link.style.cursor = 'pointer';
    link.innerText = 'Parse connections';
    link.onclick = getAllConnectionsInfo;
    container.appendChild(document.createElement('br'));
    container.appendChild(link);
}

function getAllConnectionsInfo() {
    loadConnections(() => {
        const connectionContainers = document.querySelectorAll('.mn-connection-card__details');
        const connections = [];

        connectionContainers.forEach(container => {
            const name = container.querySelector('.mn-connection-card__name').innerText;
            const occupation = container.querySelector('.mn-connection-card__occupation').innerText;

            const connection = {'name': name, 'occupation': occupation};
            connections.push(connection);
        });

        download(JSON.stringify(connections), 'biz_connections.json');
    });
}

function loadConnections(onComplete) {
    scroll(0, onComplete);
}

function scroll(currentMaxHeight, onComplete) {
    const newHeight = document.body.scrollHeight;
    if(newHeight !== currentMaxHeight) {
        window.scrollTo(0, newHeight);
        setTimeout(() => scroll(newHeight, onComplete), 2000);
    } else {
        onComplete();
    }
}

domReady(addUI);
