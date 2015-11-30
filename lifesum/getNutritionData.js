// ==UserScript==
// @name Lifesum data retriever
// @namespace https://github.com/Miicroo/TamperMonkey/tree/master/lifesum
// @version 1.0
// @description Retrieves diet data from lifesum.
// @author Miicroo
// @match lifesum.com
// @grant none
// @copyright 2015+, Micro
// @require http://code.jquery.com/jquery-latest.js
// @require https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    if(isLoggedIn()) {
        addInput();
    }
});

function isLoggedIn() {
	return $('.name').length > 0;
}

function addInput() {
    var container = $('body')[0];
	
    var startDate = '<input type="text" value="2015-01-01" id="startDate" />';
    var endDate = '<input type="text" value="'+((new Date()).yyyymmdd())+'" id="endDate" />';
    var button = '<button id="startDownload">Download</button>'; // Button to trigger download
    
    // Add elements to container
    container.innerHTML = startDate+' '+endDate+' '+button+' '+container.innerHTML;
    
    var dlButton = document.getElementById('startDownload');
    dlButton.onclick = function() {retrieveData();};
}

function retrieveData() {
    var current = new Date(document.getElementById('startDate').value);
    var last = new Date(document.getElementById('endDate').value);
    var dayAsMs = 86400000;
    var numDays = ((last.getTime()-current.getTime())/dayAsMs)+1; // Number of days between current (inclusive) and last (inclusive).
	
    // Global variables (ugh!, but they are practcial/needed for the asynchronous calls)
    var guids = generateGuidList(numDays);
    window.guids = guids;
    window.responseData = new Array();
	
    for(i = 0; i<numDays; i++) {
        getData(current.yyyymmdd(), guids[i]);
        current = new Date(current.getTime()+dayAsMs); // Move to next day
    }
}

function getData(date, uuid) {
    $.get('/webapi/v1/diary/day/'+date, function(data) {
        // Data arrives as JavaScript object!
        if(data.meta.code == 200) {
            data.response.date = date;
	    window.responseData.push(data.response); // Add response to global list
        }
		
        // Remove uuid from global list to indicate we have received data
        var listIndex = window.guids.indexOf(uuid);
        if(listIndex == -1) {
            console.log("Seems date is already parsed: [date="+date+",uuid="+uuid+"]");
        } else {
            flagAsRead(uuid);
        }
        
        if(window.guids.length == 0) {
            download(JSON.stringify(window.responseData), 'lifesumData.json'); // Download data as JSON
        }
    });
}

function flagAsRead(uuid) {
    window.guids = window.guids.filter(function (el) {
        return el !== uuid;
    });
}
