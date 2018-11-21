// ==UserScript==
// @name         Squeed age
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/squeed
// @version      1.2
// @description  Squeed age
// @author       Magnus Larsson
// @match        *squeed.mangoapps.com/sites/peoples/people_directory
// @grant        nonechrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/layout/default/images/script_add.png
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
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
    const div = html.querySelector('.ma-h1.bold.user-full-name');
    return div.textContent.trim();
}

function parseBirthday(html) {
    const allNodes = Array.from(html.querySelectorAll('div'));
    const birthdayLabelIndex = allNodes.findIndex(div => div.textContent && div.textContent.indexOf('Date Of Birth') === 0);
    const birthday = allNodes[birthdayLabelIndex + 1].textContent.trim();

    return new Date(Date.parse(birthday));
}

function getAge(birthday, atDate) {
    const now = atDate || new Date();
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
    console.table(sortedByName);

    console.log('Squeeders by age: ');
    console.table(sortedByAge);

    console.log(`Oldest squeeder: ${JSON.stringify(sortedByAge[0])}`);
    console.log(`Youngest squeeder: ${JSON.stringify(sortedByAge[sortedByAge.length-1])}`);
    console.log(`Average age: ${JSON.stringify(avgAge)}`);

    downloadAsIcal(hasAge, [2017,2018]);
}

function downloadAsIcal(birthdayArray, yearsToExport) {
    const events = [];
    yearsToExport.forEach(year => {
        const bdaysForYear = birthdayArray.map(bday => {
            let bdayAtYear = new Date(bday.birthday.getTime());
            bdayAtYear.setFullYear(year);
            const bdayAtYearStr = formatAsYmd(bdayAtYear);
            const description = `${bday.name} fyller ${getAge(bday.birthday, bdayAtYear)}`;
            return {'date':bdayAtYearStr,'description':description};
        });
        events.push(...bdaysForYear);
    });

    const calendar = createCalendar(events);
    download(calendar, 'squeed.ics');
}

function formatAsYmd(dateInst) {
    return `${dateInst.getFullYear()}${pad(dateInst.getMonth()+1)}${pad(dateInst.getDate())}`;
}

function formatIcsDateTime(date) {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const minute = pad(date.getUTCMinutes());
  const second = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

function pad(i) {
  return i < 10 ? `0${i}` : `${i}`;
}

function createCalendar(events) {
  const iCalendarData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//www.squeed.com//iCal Event Maker',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Berlin',
    'TZURL:http://tzurl.org/zoneinfo-outlook/Europe/Berlin',
    'X-LIC-LOCATION:Europe/Berlin',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE'
    ];
    const eventData = events.map(e => parseEvent(e));

    iCalendarData.push(...eventData);
    iCalendarData.push('END:VCALENDAR');

  	return iCalendarData.join('\r\n');
}

function parseEvent(event) {
		return [
    	'BEGIN:VEVENT',
    	'DTSTAMP:' + formatIcsDateTime(new Date()),
    	'UID:' + guid() + '@squeed.com',
    	'DTSTART;VALUE=DATE:' + event.date,
    	'SUMMARY:' + event.description,
    	'END:VEVENT'
      ].join('\r\n');
}

addUI();
