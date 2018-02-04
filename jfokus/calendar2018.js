// ==UserScript==
// @name         JFokus calendar
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/jfokus
// @version      1.0
// @description  JFokus Calendar
// @author       Magnus Larsson
// @match        *www.jfokus.se/jfokus/schedule.jsp
// @grant        nonechrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/layout/default/images/script_add.png
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

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
    	'DTSTART;VALUE=TIME:' + event.startDate,
    	'DTEND;VALUE=TIME:' + event.endDate,
    	'SUMMARY:' + event.description,
    	'END:VEVENT'
      ].join('\r\n');
}


const events = Array.from(document.querySelectorAll('.schedule_day'))
	.map((day,dayIndex) => Array.from(day.querySelectorAll('.item'))
					.map(item => {
						const time = item.querySelector('h2').innerText;
						const timeSplit = time.replace(/\./g, ':').split('-');
						const startTime = timeSplit[0];
						const endTime = timeSplit[1];

						let startDate = new Date(`2018-02-05 ${startTime}:00`);
						startDate.setDate(startDate.getDate() + dayIndex);
						let endDate = new Date(`2018-02-05 ${endTime}:00`);
						// Check invalid date
						if(isNaN(endDate.getTime())) {
							endDate = new Date(startDate.getTime());
							endDate.setUTCHours(startDate.getUTCHours() + 1);
						} else {
							endDate.setDate(endDate.getDate() + dayIndex);
						}

						const room = item.querySelector('h4') ? item.querySelector('h4').innerText : '';

						const contentNode = item.querySelector('h3');
						const content = contentNode.querySelector('a') ? contentNode.querySelector('a').innerText : contentNode.innerText;

						return {'startDate': startDate, 'endDate': endDate, 'room': room, 'content': content};
					}))
	.reduce((a,b) => a.concat(b), [])
	.map(event => {return {'description': `${event.content} (${event.room})`, 'startDate': formatIcsDateTime(event.startDate), 'endDate': formatIcsDateTime(event.endDate)};});


 const calendar = createCalendar(events);
 download(calendar, 'jfokus.ics');
