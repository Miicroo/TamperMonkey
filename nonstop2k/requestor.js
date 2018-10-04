// ==UserScript==
// @name         nonstop2k MIDI requests
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/nonstop2k
// @version      1.0
// @description  Add data to MIDI requests
// @author       Micro
// @match        *www.nonstop2k.com/midi-files/request.php*
// @grant        none
// @copyright    2016+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    const urls = getUrls();
    const columnIds = addColumnsForUrl(urls);

    for(var i = 0; i<urls.length; i++) {
        setInfoForIdFromUrl(columnIds[i], urls[i]);
    }
});

function getUrls() {
    const listContainer = document.querySelector('.midiRequest');
    const listItemsIncludingLink = Array.from(listContainer.querySelectorAll('.trackTitle'));
    const links = listItemsIncludingLink.map(title => title.querySelector('a'));

    return links.map(a => a.getAttribute('href'));
}

function addColumnsForUrl(urls) {
    const uuids = [];
    urls.forEach(url => {
        const uuid = guid();
        uuids.push(uuid);

        var column = document.createElement('div');
        column.id = uuid;
        column.style.testAlign='center';
        column.style.cssFloat = 'right';
        column.style.lineHeight = '50px';
        column.style.top = '10px';
        column.style.textTransform = 'uppercase';
        column.style.verticalAlign = 'middle';
        const child = getChildIdToInsertAfter(url);
        child.parentNode.appendChild(column);
    });
    return uuids;
}

function getChildIdToInsertAfter(url) {
    const ridIndex = url.indexOf("rid=")+4;
    let ridEnd = url.indexOf("&", ridIndex);
    if(ridEnd === -1) {
        ridEnd = url.length;
    }
    const childId = `request_${url.substring(ridIndex, ridEnd)}`;
    console.log(childId);

    return document.querySelector(`#${childId}`);
}

function setInfoForIdFromUrl(id, url) {
    $.get(url, function(data) {
        const requester = getRequesterFromData(data);
        $(`#${id}`).text(requester);
    });
}

function getRequesterFromData(data) {
    const requester = $('#leftbox > p', data);
    const requesterText = requester.text();
    const userId = requesterText.replace('This MIDI is requested by ', '').replace('.', '');
    return userId;
}
