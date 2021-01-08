// ==UserScript==
// @name         Travian alerter
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/travian
// @version      1.0
// @description  Alerts when Travian timer is finished
// @author       Miicroo
// @match        https://nysx1.europe.travian.com/**
// @grant        none
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

function notify(message) {
  if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
      new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
          new Notification(message);
      }
    });
  }
}


Array.from(document.querySelectorAll('.timer[counting="down"]'))
    .map(timer =>
         {
            const timeLeft = parseInt(timer.getAttribute('value'));
            const now = new Date();
            now.setSeconds(now.getSeconds() + timeLeft);
            return {
                'text': timer.previousSibling.textContent.trim(),
                'timeout': timeLeft,
                'id': now.getTime()
            };
         })
    .forEach(timer => {
        setTimeout(() => notify(`Timer for ${timer.text} finished!`), timer.timeout * 1000);
        console.log(`Set timer for ${timer.text} with id ${timer.id}`)
    });
