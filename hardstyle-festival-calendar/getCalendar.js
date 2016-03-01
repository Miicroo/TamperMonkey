// ==UserScript==
// @name         Festival calendar
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/hardstyle-festival-calendar
// @version      1.0
// @description  Hardstyle festival calendar
// @author       Micro
// @match        http://www.electronic-festivals.com/music-genre/hardcore-hardstyle
// @grant        none
// @copyright    2016+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

$(document).ready(function() {
    jQuery.fn.exists = function(){return this.length>0;}
    
    var first = 0;
    var lastHref = $('a', $('.pager .last')).attr('href');
    var last = parseInt(lastHref.substring(lastHref.lastIndexOf('page=')+5, lastHref.length)); // TODO: breaks easily
    
    window.numPages = (last+1);
    window.pagesLoaded = 0;
    window.eventData = '';
    
    for(i = first; i<=last; i++) {
        parseWebpage(i);
    }
});

function parseWebpage(pageNum) {
    var url = window.location.href+"?page="+pageNum;
    $.get(url, function(data) {
        var calStr = '';
        var content = $('.view-content li', data);
        for(i = 0; i<content.length; i++) {
            var li = content[i];
            var eventStr = parseEvent(li);
            calStr += eventStr;
        }
        
        window.eventData += calStr;
        window.pagesLoaded += 1;
        
        if(window.pagesLoaded == window.numPages) {
            createCalendar(window.eventData);
        }
    });
}

function createCalendar(events) {
    var calStr = "BEGIN:VCALENDAR\r\n";
    calStr += "VERSION:2.0\r\n";
    calStr += "PRODID:-//micro/festical//NONSGML v1.0//EN\r\n";
    
    calStr += events;
    
    calStr += "END:VCALENDAR\r\n";
    
    download(calStr, 'hardstylecalendar.ics');
}

function parseEvent(htmlData) {
    var startDate = new Date($("[property='schema:startDate']", htmlData).attr('content'));
    var endDate = new Date(startDate.getTime()); // Assume no end date
    endDate.setDate(endDate.getDate() + 1);
    if($("[property='schema:endDate']", htmlData).exists()) {
        endDate = new Date($("[property='schema:endDate']", htmlData).attr('content'));
        endDate.setHours(23);
    }
    var visitors = $.trim($(".field-visitors", htmlData).text());
    var confirmedActs = $.trim($(".field-number-of-acts", htmlData).text());
    var location = $.trim($("[property='schema:location']", htmlData).text());
    var festivalInfo = $("[property='schema:url']", htmlData);
    var festivalUrl = festivalInfo[0].href;
    var festivalName = $.trim(festivalInfo.text());
    
    var eventStr = "";
    eventStr += "BEGIN:VEVENT\r\n";
    eventStr += "UID:"+festivalName.replace(" ", "-")+"@hs-festivalcalendar.com\r\n";
    eventStr += "DTSTAMP:"+toIcsDate(new Date())+"\r\n";
    eventStr += "DTSTART:"+toIcsDate(startDate)+"\r\n";
    eventStr += "DTEND:"+toIcsDate(endDate)+"\r\n";
    eventStr += "SUMMARY:"+festivalName+"\r\n";
    eventStr += "DESCRIPTION:"+festivalName+" ("+location+"), "+visitors+", "+confirmedActs+", Website: "+festivalUrl+"\r\n";
    eventStr += "END:VEVENT\r\n";
    
    return eventStr;
}

function toIcsDate(date) {
    var pre = 
        date.getFullYear().toString() +
        ((date.getMonth() + 1)<10? "0" + (date.getMonth() + 1).toString():(date.getMonth() + 1).toString()) + 
        ((date.getDate() + 1)<10? "0" + date.getDate().toString():date.getDate().toString());

    var hours = (date.getHours() < 10 ? "0" : "") + date.getHours().toString();
    var mins = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes().toString();
    var post = hours + mins + "00";

    return pre + "T" + post;
}
