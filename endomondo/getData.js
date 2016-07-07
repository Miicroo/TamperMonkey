// ==UserScript==
// @name Endomondo data retriever
// @namespace https://github.com/Miicroo/TamperMonkey/tree/master/endomondo
// @version 1.0
// @description Retrieves workout data from endomondo.
// @author Miicroo
// @match https://www.endomondo.com/home
// @grant none
// @copyright 2015+, Micro
// @require http://code.jquery.com/jquery-latest.js
// @require https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    setTimeout(go, 5000); // wait for other content to finish loading
});

function go() {
    if(isLoggedIn()) {
        addInput();
    }
}

function isLoggedIn() {
	return $('.header-member-profile').length > 0;
}

function addInput() {
    var container = $('.container')[0];
	
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
    last = new Date(last.getTime()+dayAsMs); // Add one day to ensure that the last day is included
	
    var profileId = getProfileId();
    
    getData(profileId, current.yyyymmdd(), last.yyyymmdd());
}

function getProfileId() {
    var profileId = '';
    var profilePattern = 'profile/';
    var link = $('.header-member-profile-name')[0].href;
    console.log(link);
    var index = link.indexOf(profilePattern);
    if(index != -1) {
        profileId = link.substring(index+profilePattern.length, link.length);
    }
    
    return profileId;
}

function getData(profileId, startDate, endDate) {
    $.get('../rest/v1/users/'+profileId+'/workouts?before='+endDate+'&after='+startDate, function(data) {
        // Data arrives as JavaScript object!
        data = '{"data":'+JSON.stringify(data)+'}';
        download(data, 'endomondoData.json'); // Download data as JSON
    });
}
