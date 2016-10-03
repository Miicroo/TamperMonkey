// ==UserScript==
// @name         nonstop2k upcoming MIDIs
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/nonstop2k
// @version      1.0
// @description  Add data to upcoming MIDIs
// @author       Micro
// @match        *www.nonstop2k.com/midi-files/upcoming/*
// @grant        none
// @copyright    2016+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    var selector = '.midi-table-hover'; // Selector that determines a row with song data

    var urls = getUrls(selector);
    addHeaderColumn('Creator:');
    var columnIds = addColumns(selector);

    for(var i = 0; i<urls.length; i++) {
        setInfoForIdFromUrl(columnIds[i], urls[i]);
    }
});

function getUrls(selector) {
    var urls = [];
    var rows = $(selector);
    for(var i = 0; i<rows.length; i++) {
        var aTags = $('a', rows[i]); // Get all <a>-tags in row
        var theLink = (aTags[1]).href; // First link is to artist, second list is to song
        urls.push(theLink);
    }
    return urls;
}

function addHeaderColumn(text) {
    var header = $('tr')[0];
    var column = document.createElement('td');
    column.innerHTML = '<b>'+text+'</b>';
    header.appendChild(column);
}

function addColumns(classSelector) {
    var uuids = [];
    var rows = $(classSelector);
    for(var i = 0; i<rows.length; i++) {
        var uuid = guid();
        uuids.push(uuid);

        var column = document.createElement('td');
        column.id = uuid;
        rows[i].appendChild(column);
    }
    return uuids;
}

function setInfoForIdFromUrl(id, url) {
    $.get(url, function(data) {
        var creator = getCreatorFromData(data);
        $('#'+id).text(creator);
        if(hasHighlightColor(creator)) {
            $('#'+id).css('background-color', getHighlightColor(creator));
        }
    });
}

function getCreatorFromData(data) {
    var dlList = $('dl', data);
    // <dl>s contain two children, first is key, second is value
    for(var i = 0; i<dlList.length; i++) {
        var dl = dlList[i];
        if(dl.children[0].innerText == 'MIDI made by') {
            return dl.children[1].innerText;
        }
    }
    return undefined;
}

function hasHighlightColor(creator) {
    return typeof highlightColors()[creator] !== 'undefined';
}

function getHighlightColor(creator) {
    return highlightColors()[creator];
}

function highlightColors() {
    var colors = [];
    colors.Aw8 = 'rgba(135, 206, 235, 0.8)';
    colors.frozensunrise = 'rgba(247, 229, 126, 0.8)';
    colors.AirbourneDE = 'rgba(226, 174, 252, 0.8)';
    colors['Teccam(AirbourneDE)'] = 'rgba(226, 174, 252, 0.8)';
    colors.RevizorMedia = 'rgba(252, 174, 174, 0.8)';
    colors.ObserveDJ = 'rgba(174, 252, 183)';
    return colors;
}
