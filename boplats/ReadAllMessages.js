// ==UserScript==
// @name         Boplats read all messages
// @namespace    https://github.com/Miicroo/boplats/blob/master/
// @version      1.0
// @description  Marks all messages in your Boplats inbox as read.
// @author       Miicroo
// @match        https://nya.boplats.se/minsida/meddelande
// @grant        none
// @copyright    2015+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

$(document).ready(function() {
    addReadAllButton();
});

function addReadAllButton() {
    var parentId = 'meddelande';
    var buttonText = 'Markera alla som lästa';
    var progressBarId = getProgressBarId();
    
    var buttonContainer = $('#'+parentId).find('p')[0]; // Find <p> to insert button
    buttonContainer.innerHTML += '<br><br><input type="button" id="readAllMessages" value="'+buttonText+'" /><div id="'+progressBarId+'"></div>';
    
    var link = document.getElementById('readAllMessages');
    link.onclick = function() {readAllMessages();};
}

function getProgressBarId() {
    return 'readProgress';
}

function readAllMessages() {
    var links = getMessageLinks();
    var guids = generateGuidList(links.length);
    console.log("Got "+guids.length+" guids when wanted "+links.length);
    
    window.guids = guids;
    window.numOfGuids = guids.length;
    
    if(window.guids.length > 0) {
        for(i = 0; i<links.length; i++) {
            read(links[i], guids[i]);
        }
    } else {
        updateProgress(100);
        location.reload();        
    }
}

function getMessageLinks() {
    var links = $('.unread').find('a').filter(function() {
        return this.href.match(/https:\/\/nya\.boplats\.se\/minsida\/meddelande\//);
    });
    
    msgLinks = [];
    for(i = 0; i<links.length; i++) {
        msgLinks.push(links[i].getAttribute('href'));
    }
    
    return msgLinks;
}

function generateGuidList(listLength) {
    guids = [];
    for(i = 0; i<listLength; i++) {
        guids.push(guid());
    }
    return guids;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +s4() + '-' + s4() + s4() + s4();
}

function read(msgUrl, uuid) {
    $.get(msgUrl, function(data) {
        // Here we have read the message
        var listIndex = window.guids.indexOf(uuid);
        if(listIndex == -1) {
            console.log("Could not read message at "+msgUrl+" (uuid="+uuid+")");
        } else {
            flagAsRead(uuid);
            var messagesRead = (window.numOfGuids-window.guids.length);
            var percentage = round(messagesRead/window.numOfGuids*100.0, 1);
            updateProgress(percentage);
        }
        
        if(window.guids.length == 0) {
            location.reload();
        }
    });
}

function flagAsRead(uuid) {
    window.guids = window.guids.filter(function (el) {
        return el !== uuid;
    });
}

function round(value, decimals) {
    var powTen = Math.pow(10, decimals);
    return Math.round(value*powTen)/powTen;
}

function updateProgress(percentage) {
    $('#'+getProgressBarId()).text('Läser meddelanden, '+percentage+'% klart...');
}
