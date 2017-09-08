// ==UserScript==
// @name         Squeed age
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/squeed
// @version      1.0
// @description  Squeed age
// @author       Magnus Larsson
// @match        *squeed.mangoapps.com/sites/peoples/people_directory
// @grant        nonechrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/layout/default/images/script_add.png
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

function addUI() {
    const container = document.querySelector('.filter-container');
    const buttonDiv = document.createElement('div');
    buttonDiv.classList.add('narrow-by-container');
    buttonDiv.classList.add('ma-h4');

    const button = document.createElement('button');
    button.innerText = 'Print squeed age data';
    button.onclick = calculateAge;
    buttonDiv.appendChild(button);
    container.appendChild(buttonDiv);
}


function calculateAge() {
    loadSqueeders(() => {
        const profiles = getProfileLinks();
        window.numberOfSqueeders = profiles.length;
        parseProfiles(profiles);
    });
}

function loadSqueeders(onComplete) {
    scroll(0, onComplete);
}

function scroll(currentMaxHeight, onComplete) {
    const newHeight = document.body.scrollHeight;
    if(newHeight !== currentMaxHeight) {
        window.scrollTo(0, newHeight);
        setTimeout(() => scroll(newHeight, onComplete), 3000);
    } else {
        onComplete();
    }
}

function getProfileLinks() {
    const allLinkElements = Array.from(document.querySelectorAll('.bluelinks.userFlyoutImage.clearfix'));
    return allLinkElements.map(a => a.href + '?full_page=Y');
}

function parseProfiles(profileLinks) {
    window.numberOfParsedSqueeders = 0;
    profileLinks.forEach(link => parseProfile(link));
}

function parseProfile(profileLink) {
    $.get(profileLink, function(data) {
        if(!window.squeedData) {
            window.squeedData = [];
        }

        const parser = new DOMParser();
        const html = parser.parseFromString(data, "text/html");
        const name = parseName(html);
        const birthday = parseBirthday(html);
        const age = getAge(birthday);
        const obj = {'name':name,'birthday':birthday,'age':age};
        window.squeedData.push(obj);
        window.numberOfParsedSqueeders++;

        if(window.numberOfParsedSqueeders >= window.numberOfSqueeders) {
            printData(window.squeedData);
            delete window.squeedData;
        }
    });
}

function parseName(html) {
    const div = html.querySelector('.ma-h3.bold');
    return div.textContent.trim();
}

function parseBirthday(html) {
    const allNodes = Array.from(html.querySelectorAll('td'));
    const birthdayLabelIndex = allNodes.findIndex(td => td.textContent && td.textContent.indexOf('Födelsedag') !== -1);
    const birthday = allNodes[birthdayLabelIndex + 1].textContent.trim();
    const birthdayAsDateStr = birthday.replace('/', '-').replace('/', '-') + 'T00:00:00';

    return new Date(birthdayAsDateStr);
}

function getAge(birthday) {
    const now = new Date();
    let age = now.getFullYear()-birthday.getFullYear()-1;
    if(now.getMonth() > birthday.getMonth()) {
        age++;
    } else if(now.getMonth() == birthday.getMonth() && now.getDate() >= birthday.getDate()) {
        age++;
    }

    return age;
}

function printData(data) {
    const sortedByName = data;
    const hasAge = data.filter(p => !isNaN(p.age));
    const sortedByAge = hasAge.sort((p1,p2) => p1.birthday.getTime()-p2.birthday.getTime());
    const totalAge = hasAge.reduce((age,p) => age+p.age, 0);
    const avgAge = totalAge / hasAge.length;

    console.log('Squeeders by name: ');
    console.log(sortedByName);

    console.log('Squeeders by age: ');
    console.log(sortedByAge);

    console.log(`Oldest squeeder: ${JSON.stringify(sortedByAge[0])}`);
    console.log(`Youngest squeeder: ${JSON.stringify(sortedByAge[sortedByAge.length-1])}`);
    console.log(`Average age: ${JSON.stringify(avgAge)}`);

    downloadAsIcal(hasAge);
}

function downloadAsIcal(birthdayArray) {
 /*   msgData1 = $('.start-time').text();
msgData2 = $('.end-time').text();
msgData3 = $('.Location').text();

var icsMSG = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Squeed//NONSGML v1.0//EN\nBEGIN:VEVENT\nUID:magnus.larsson@squeed.com\nDTSTAMP:20120315T170000Z\nATTENDEE;CN=My Self ;RSVP=TRUE:MAILTO:me@gmail.com\nORGANIZER;CN=Me:MAILTO::me@gmail.com\nDTSTART:" + msgData1 +"\nDTEND:" + msgData2 +"\nLOCATION:" + msgData3 + "\nSUMMARY:Our Meeting Office\nEND:VEVENT\nEND:VCALENDAR";

$('.button').click(function(){
    window.open( "data:text/calendar;charset=utf8," + escape(icsMSG));
});*/
}

addUI();
