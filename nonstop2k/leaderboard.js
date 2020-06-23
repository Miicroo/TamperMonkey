// ==UserScript==
// @name         nonstop2k leaderboard
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/nonstop2k
// @version      3.0
// @description  Leaderboard nonstop2k
// @author       Micro
// @match        *www.nonstop2k.com/midi-files/archive.php*
// @grant        none
// @copyright    2016+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    var container = document.querySelector('.midiMeta');
    const lastElementInContainer = document.querySelector('#shareMidi');

    const separator = document.createElement('span');
    separator.classList.add('bulletSeparator');

    container.insertBefore(separator, lastElementInContainer);

    const div = document.createElement('div');
    div.style.borderTop = '1px solid #EFEFEF';
    div.style.padding = '12px 0';

    var link = document.createElement('a');
    link.onclick = downloadStatistics;
    link.innerText = 'Get statistics';
    link.style.color = '#90c74f';
    link.style['text-decoration'] = 'underline';
    link.style.cursor = 'pointer';
    div.appendChild(link);

    container.insertBefore(div, lastElementInContainer);
});

function downloadStatistics() {
    var pagination = $('.pagination').children(0);
    var paginationLen = pagination.length;
    var linkToLast = pagination[paginationLen-1].href;
    var lastPageNum = getQueryVariable(linkToLast, 'p');
    var links = generateLinks(lastPageNum);
    parseArchivePages(links);
}

function getQueryVariable(url, variable) {
    url = url.split("?")[1];
    var query = url.substring(1);
    var vars = query.split("&");
    for (var i = 0; i<vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return undefined;
}

function generateLinks(lastPage) {
    var links = [];
    for(var i = 1; i<=lastPage; i++) {
        links.push('https://www.nonstop2k.com/midi-files/archive.php?l=All&cid=0&kid=0&p='+i);
    }
    return links;
}

function parseArchivePages(pageLinks) {
    console.log('Parsing '+pageLinks.length+' archive pages...');
    parseArchivePage(pageLinks, 0, []);
}

function parseArchivePage(pageLinks, index, siteMap) {
    console.log('Archive page ' + (index + 1));
    $.get(pageLinks[index], function(data) {
        siteMap.push(data);
        if(siteMap.length >= pageLinks.length) {
            parseDataUrls(siteMap);
        } else {
            parseArchivePage(pageLinks, index+1, siteMap);
        }
    });
}

function parseDataUrls(dataList) {
    var urls = [];
    for(var i = 0; i<dataList.length; i++) {
        urls = urls.concat(getUrls(dataList[i], '.coverImg'));
    }
    parseStatistics(urls);
}

function getUrls(data, selector) {
    var urls = [];
    const linkTags = $(selector, data);
    for(var i = 0; i<linkTags.length; i++) {
        urls.push(linkTags[i].href);
    }
    return urls;
}

function parseStatistics(midiUrls) {
    console.log('Parsing '+midiUrls.length+' MIDI pages...');
    var statistics = [];
    parseStatistic(midiUrls, 0, statistics, new Date().getTime());
}

function parseStatistic(midiUrls, index, statistics, startMillis) {
    if(index === midiUrls.length) {
        showStatistics(statistics);
    } else {
        $.get(midiUrls[index], function (data) {
            var info = getInfo(data);
            statistics.push(info);

            var now = new Date().getTime();
            var diff = now-startMillis;
            var timePerFile = diff/(index+1);
            var filesLeft = midiUrls.length-(index+1);
            var etaLeft = (timePerFile*filesLeft)/1000;
            console.log(index + ' MIDIs done... ETA: '+Math.round(etaLeft));

            parseStatistic(midiUrls, index+1, statistics, startMillis);
        });
    }
}

function showStatistics(stats) {
    downloadLargeFile(JSON.stringify(stats), 'nonstop2k.json');
}

function downloadLargeFile(data, filename) {
    var hiddenLink = document.createElement('a');
    var blob = new Blob([data], { type: 'text/json' });

    hiddenLink.href = URL.createObjectURL(blob);
    hiddenLink.target = '_blank';
    hiddenLink.download = filename;
    hiddenLink.click();
}

function getInfo(data) {

    const dataObjects = [
        getTrackInfo(data),
        getInfoFromDataTable(data),
        getPublishDate(data),
        getLabel(data),
        getCreator(data)
    ];

    return mergeListToObject(dataObjects);
}

function getTrackInfo(data) {
    const selector = $('.secContainer > h1', data);
    const trackData = selector[0].innerHTML.split('<br>');

    return {'artist': trackData[0], 'tracktitle': trackData[1].replace('MIDI', '').trim()};
}

function getInfoFromDataTable(data) {
    const midiDiv = $('#midifeatures', data);
    const dts = $('dt', midiDiv);
    const dds = $('dd', midiDiv);
    const dtMapping = {'tempo': 'bpm'};

    const mappedObjects = dts.map((index, dt) => { // jQuery uses index first
        const lowerCaseKey = dt.textContent.replace(/ /g, '').toLowerCase();
        const key = dtMapping[lowerCaseKey] || lowerCaseKey;
        const value = dds[index].textContent;
        const endOfValue = value.indexOf('\n') !== -1 ? value.indexOf('\n') : value.length;
        const formattedValue = value.substring(0, endOfValue);

        return {[key]: formattedValue};
    }).toArray();

    return mergeListToObject(mappedObjects);
}

function getPublishDate(data) {
    const publishDate = $('.pubDate', data)[0].textContent.replace('Released: ', '');
    return {'publishdate': publishDate};
}

function getLabel(data) {
    const labelSelector = $('#midiLabel', data);
    const label = labelSelector.length > 0 ? labelSelector[0].textContent : '';
    return {'label': label};
}

function getCreator(data) {
    const creatorSelector = $('#midiCreator', data);
    const creatorText = creatorSelector.length > 0 ? creatorSelector[0].textContent : 'Anonymous';
    const endOfCreator = creatorText.indexOf('.') !== -1 ? creatorText.lastIndexOf('.') : creatorText.length;
    const creator = creatorText.substring(0, endOfCreator);
    return {'midimadeby': creator};
}

function mergeListToObject(objectList) {
    return Object.assign({}, ...objectList);
}
