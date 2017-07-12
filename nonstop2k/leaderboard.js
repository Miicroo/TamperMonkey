// ==UserScript==
// @name         nonstop2k leaderboard
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/nonstop2k
// @version      2.0
// @description  Leaderboard nonstop2k
// @author       Micro
// @match        *www.nonstop2k.com/midi-files/archive.php*
// @grant        none
// @copyright    2016+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    var container = $('#midi_index')[0];
    var link = document.createElement('a');
    link.onclick = downloadStatistics;
    link.innerText = 'Get statistics';
    link.style.color = '#90c74f';
    link.style['text-decoration'] = 'underline';
    link.style.cursor = 'pointer';
    container.insertBefore(link, container.children[5]);
});

function downloadStatistics() {
    var pagination = $('.pagination').children(0);
    var paginationLen = pagination.length;
    var linkToLast = pagination[paginationLen-1].href;
    var lastPageNum = 20;//getQueryVariable(linkToLast, 'p');
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
    var siteMap = [];
    for(var i = 0; i<pageLinks.length; i++) {
        $.get(pageLinks[i], function(data) {
            siteMap.push(data);
            if(siteMap.length >= pageLinks.length) {
                parseDataUrls(siteMap);
            }
        });
    }
}

function parseDataUrls(dataList) {
    var urls = [];
    for(var i = 0; i<dataList.length; i++) {
        urls = urls.concat(getUrls(dataList[i], '.midi-table-hover'));
    }
    parseStatistics(urls);
}

function getUrls(data, selector) {
    var urls = [];
    var rows = $(selector, data);
    for(var i = 0; i<rows.length; i++) {
        var aTags = $('a', rows[i]); // Get all <a>-tags in row
        var theLink = (aTags[1]).href; // First link is to artist, second list is to song
        urls.push(theLink);
    }
    return urls;
}

function parseStatistics(midiUrls) {
    console.log('Parsing '+midiUrls.length+' MIDI pages...');
    var statistics = [];
    parseStatistic(midiUrls, 0, statistics, new Date().getTime());
}

function parseStatistic(midiUrls, index, statistics, startMillis) {
    if(index == midiUrls.length) {
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
    download(JSON.stringify(stats), 'nonstop2k.json');
}

function getInfo(data) {
	var midiDiv = $('#midiInfo', data);
	var dts = $('dt', midiDiv);
	var dds = $('dd', midiDiv);

	var obj = {};
	for(var i = 0; i<dts.length; i++) {
		var key = dts[i].textContent.replace(/ /g, '').toLowerCase();
		var value = dds[i].textContent;
		obj[key] = value;
	}

	var pubDateFooter = $('.pubdatefooter', data)[0];
	obj.publishdate = pubDateFooter.textContent.replace('Published on: ', '');

	return obj;
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
