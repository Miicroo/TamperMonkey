// ==UserScript==
// @name         Boplats Sorter
// @namespace    https://github.com/Miicroo/boplats/blob/master/
// @version      0.1
// @description  Sorts the apartments that you didn't get by date.
// @author       Micro
// @match        https://nya.boplats.se/minsida/ansokta/past/1hand
// @grant        none
// @copyright    2015+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var apartment = function(boplatsData, queueDays) {
    return {
        boplatsData: boplatsData,
        queueDays: queueDays
    };
};

var noDateApartment = function(boplatsData) {
    return apartment(boplatsData, -1);
}

function sortDesc(a, b) {
    if (a.queueDays > b.queueDays) {
        return -1;
    } else if (a.queueDays < b.queueDays) {
        return 1;
    } else {
        return 0;
    }
}

function sortAsc(a, b) {
    if(a.queueDays < 0) {
        return 1;
    } else if(b.queueDays < 0) {
        return -1;
    } else if (a.queueDays < b.queueDays) {
        return -1;
    } else if (a.queueDays > b.queueDays) {
        return 1;
    } else {
        return 0;
    }
}


$(document).ready(function() {   
    var allApartments = new Array();
    
    var historyTables = document.getElementsByClassName('history');
    var historyTable = historyTables[0].children[0]; // <table .history> -> <tbody>
    
    for(var i = 0; i<historyTable.childElementCount; i++) {
        child = historyTable.children[i];
        
        leaseInfos = child.getElementsByClassName("leased");
        if(leaseInfos.length > 0) {
            // Found lease info!
            leased = leaseInfos[0].textContent || leaseInfos[0].innerText || "";
            
            if(leased.indexOf("Gick till en sökande med ") != -1) {
                // Lease info contains number of queueDays
                leased = leased.split("Gick till en sökande med ")[1];
                leased = leased.split(" ")[0];
                allApartments.push(apartment(child, leased));
            } else {
                allApartments.push(noDateApartment(child));
            }
        } else {
            allApartments.push(noDateApartment(child));
        }
    }
    
    allApartments.sort(sortAsc);
    
    // Remove old entries
    while (historyTable.firstChild) {
        historyTable.removeChild(historyTable.firstChild);
    }
    
    // Add sorted entries
    for(var i = 0; i<allApartments.length; i++) {
        historyTable.appendChild(allApartments[i].boplatsData);
    }
});
