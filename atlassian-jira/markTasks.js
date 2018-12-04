// ==UserScript==
// @name         Jira background editor
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/atlassian-jira
// @version      1.0.1
// @description  Changes the background color of your jira tasks. Tasks are found based on your avatar. Works for jira 6.4.
// @author       Miicroo
// @match        http://YOUR_JIRA_SERVER/secure/RapidBoard.jspa*
// @grant        none
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==



domReady(function() {
    setTimeout(main, 5000); // Wait until board is loaded
});

function main() {
    var username = shouldLoadUsernameFromHeader() ? getUsernameFromHeader() : getUsername();
    if(username.length == 0) {
        username = getUsername(); // Fall back in case any other alternative failed
    }

    markTasks(username);
}

function shouldLoadUsernameFromHeader() {
    return true;
}

// Get default username
function getUsername() {
    return 'Magnus Larsson (12)';
}

// Get new background color for tasks
function getBgColor() {
    return '#96E2FF';
}


// Load username dynamically from header
function getUsernameFromHeader() {
    var nameContainer = document.getElementById('header-details-user-fullname');
    if(nameContainer.hasAttribute('data-displayname')) {
        return nameContainer.getAttribute('data-displayname');
    } else {
        return '';
    }
}

// Marks all tasks assigned to username
function markTasks(username) {
    var searchPattern = 'Assignee: '+username;

    var tasks = document.getElementsByClassName("js-issue"); // Find all tasks
    for(var i = 0; i<tasks.length; i++) {
        var avatars = tasks[i].getElementsByClassName('ghx-avatar-img'); // Find user avatar
        if(avatars.length > 0) {
            if(avatars[0].hasAttribute('alt') && avatars[0].getAttribute('alt') == searchPattern) {
                tasks[i].style.backgroundColor = getBgColor();
            }
        }
    }
}
