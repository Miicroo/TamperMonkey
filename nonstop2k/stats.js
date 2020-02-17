// ==UserScript==
// @name         nonstop2k stats
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/nonstop2k
// @version      1.0
// @description  Your stats on nonstop2k
// @author       Micro
// @match        https://www.nonstop2k.com/ucp.php?i=midi&mode=overview*
// @grant        none
// @copyright    2016+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    var container = document.querySelector('#content');
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
    container.insertBefore(div, document.querySelector('#sortArchive').nextSibling);
});

function downloadStatistics() {
    var pagination = $('.pagination').children(0);
    var paginationLen = pagination.length;
    var linkToLast = pagination[paginationLen-1].href;
    var lastPageNum = getQueryVariable(linkToLast, 'p');
    var links = generateLinks(lastPageNum);

    parsePages(links);
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
        links.push('https://www.nonstop2k.com/ucp.php?i=midi&mode=overview&p='+i);
    }
    return links;
}

function parsePages(links) {
    parsePagesRecursively(links, 0, []);
}

function parsePagesRecursively(links, index, statistics) {
    if(index == links.length) {
        download(statistics);
    } else {
        $.get(links[index], function (data) {
            const stats = parseStatistics(data);
            statistics.push(...stats);

            parsePagesRecursively(links, index+1, statistics);
        });
    }
}

function parseStatistics(data) {
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(data, 'text/html');
    return Array.from(doc.querySelector('.ucpMidiOverview')
                      .querySelectorAll('li')
                     )
        .filter((val, index) => index !== 0) // 0 is a header
        .map(row => parseMidi(row));
}

function parseMidi(row) {
    const title = row.querySelector('.ucpArtist').innerText;
    const rating = parseRating(row.querySelector('.ucpRating').innerText)
    const favourited = row.querySelector('.ucpFavs').innerText;
    const downloads = row.querySelector('.ucpDownloads').innerText;
    const credits = row.querySelector('.ucpCredits').innerText;
    const earnings = parseEarnings(row.querySelector('.ucpEarnings').innerText);
    const earningsType = row.querySelector('.ucpEarningsType').innerText;

    return {
        'title': title,
        'rating': rating,
        'favourited': favourited,
        'downloads': downloads,
        'credits': credits,
        'earnings': earnings,
        'earningsType': earningsType
    };
}

function parseRating(ratingStr) {
    const data = ratingStr.match(/[\d\.]+/gi);
    return {'rating': data[0], 'votes': data[1]};
}

function parseEarnings(earningStr) {
    const data = earningStr.split('\n');
    return {'currency': data[0], 'amount': data[1]};
}

function download(stats) {
    downloadLargeFile(JSON.stringify(stats), 'stats.nonstop2k.json');
}

function downloadLargeFile(data, filename) {
    var hiddenLink = document.createElement('a');
    var blob = new Blob([data], { type: 'text/json' });

    hiddenLink.href = URL.createObjectURL(blob);
    hiddenLink.target = '_blank';
    hiddenLink.download = filename;
    hiddenLink.click();
}
