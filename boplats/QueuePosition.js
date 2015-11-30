// ==UserScript==
// @name         Boplats queue place
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/boplats
// @version      1.0
// @description  Shows queue position on pending apartments.
// @author       Micro
// @match        https://nya.boplats.se/minsida/ansokta
// @grant        none
// @copyright    2015+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    var applications = $('.applications')[0].children[0];
    for(i = 0; i<applications.childElementCount; i++) {
        var tr = applications.children[i];
        var desc = $('.description', tr)[0];
        var aTag = $('a', desc)[0];
        var link = aTag.getAttribute("href");
        
        var aptId = guid();
        var status = $('.status', tr)[0];
        status.setAttribute("id", aptId);
        displayQueueData(link, aptId);
    }
});

function displayQueueData(aptUrl, uuid) {
    $.get(aptUrl, function(data) {
        var queueInfo = $("#sortingDetails", data).text();
        var textColor = getColor(queueInfo);
        $("#"+uuid).append(" <span style=\"color:"+textColor+"\"><i>("+queueInfo+")</i></span>");
    });
}

function getColor(queueInfo) {
    var goodColor = "#57C98C";
    var midColor = "#F5BF69";
    var badColor = "#F56969";
    
    var numSearch = " sökande just nu";
    var queuePos = " före dig";
    var replStr = (queueInfo.indexOf(numSearch) != -1 ? numSearch : queuePos);
    var position = parseInt(queueInfo.replace(replStr, "")); // position in queue
    
    if(replStr == numSearch) {
        if(position < 50) {
            return goodColor;
        } else if (position < 100) {
            return midColor;
        } else {
            return badColor;
        }
    } else {
        if(position < 20) {
            return goodColor;
        } else if(position < 50) {
            return midColor;
        } else {
            return badColor;
        }
    }
    
    return "#000000"; // Cant reach here
}
