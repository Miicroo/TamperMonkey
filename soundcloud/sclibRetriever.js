// ==UserScript==
// @name Soundcloud artist info retriever
// @namespace https://github.com/Miicroo/TamperMonkey/tree/master/soundcloud
// @version 1.0
// @description Retrieves artist info to use with sc_lib.
// @author Miicroo
// @match https://soundcloud.com/*
// @grant none
// @copyright 2016+, Micro
// @require https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

domReady (function() {
    if(isProfile()) {
        var name = getName();
        var url = getUrl();
        var country = getCountry();
        
        var obj = {"name": name, "url": url, "country": country};
        
        addDownloadLink(JSON.stringify(obj), name+".json");
    }
});

function isProfile() {
    return document.getElementsByClassName("profileHeaderInfo__userName").length > 0;
}

function getName() {
    var nameElement = document.getElementsByClassName("profileHeaderInfo__userName")[0];
    return nameElement.innerText.replace("Pro Unlimited", "");
}

function getUrl() {
    return window.location.href;
}

function getCountry() {
    var countryElement = document.getElementsByClassName("profileHeaderInfo__additional")[1];
    return countryElement.innerText.split(", ")[1];
}

function addDownloadLink(data, filename) {
    var container = document.getElementsByClassName("profileHeaderInfo__content")[0];
    var linkId = "dlLink";
    var linkElem = '<a href="#" id="'+linkId+'" style="color:#ccc;">Get SC lib profile</a>';
    container.innerHTML += '<br/><h4 class="profileHeaderInfo__additional g-type-shrinkwrap-block g-type-shrinkwrap-large-secondary">'+linkElem+'</h4>';
    
    document.getElementById(linkId).onclick = function() {download(data, filename);};
}
