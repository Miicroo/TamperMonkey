// ==UserScript==
// @name         facebook friends
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/facebook
// @version      1.0
// @description  Some facebook friend data
// @author       Micro
// @match        https://www.facebook.com/*/friends*
// @copyright    2017+, Micro
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/Miicroo/TamperMonkey/master/common/common.js
// ==/UserScript==

function addUI() {
    const container = document.querySelector('._4-rr._4-rv');
    const link = document.createElement('a');
    link.classList = '_42ft _4jy0 _4-rs _4-rt _4jy4 _517h _51sy'.split(' ');
    link.setAttribute('role', 'button');
    link.innerText = 'Get friend data';
    link.onclick = getAllFriendsInfo;
    container.appendChild(link);
}

function getAllFriendsInfo() {
    loadFriends(() => {
        const friends = getFriends();
        window.maxFriendCount = friends.length;
        window.currentFriendCount = 0;
        window.friends = [];
        friends.forEach(friend => getFriendsPartner(friend, addPartnerToFriend));
    });
}

function loadFriends(onComplete) {
    scroll(0, onComplete);
}

function scroll(currentMaxHeight, onComplete) {
    const newHeight = document.body.scrollHeight;
    if(newHeight !== currentMaxHeight) {
        window.scrollTo(0, newHeight);
        setTimeout(() => scroll(newHeight, onComplete), 2000);
    } else {
        onComplete();
    }
}

function getFriends() {
    const linkDivs = Array.from(document.querySelectorAll('.fsl.fwb.fcb'));
    const friends = linkDivs.map(div => {
        const aTag = div.querySelector('a');
        if(!aTag) {
            return undefined;
        }
        const link = aTag.getAttribute('href');
        const name = aTag.textContent;

        return {'name':name, 'link':link};
    }).filter(friend => friend);
    const friendsWithRelationshipLinks = friends.map(friend => addRelationshipParam(friend));
    return friendsWithRelationshipLinks;
}

function addRelationshipParam(friend) {
    let link = friend.link;

    if(link.indexOf('/profile.php')) {
        // Old style profile:
        // facebook.com/myusername/profile.php?id=100002223230408
        friend.link += '&sk=about&section=relationship';
    } else {
        // New style profile: facebook.com/myusername?junkjunkjunk
        const queryParamStart = link.indexOf('?');
        if(queryParamStart >= 0) {
            link = link.substring(0, queryParamStart);
            friend.link = link + '/about?section=relationship';
        }
    }
    return friend;
}

function getFriendsPartner(friend, callback) {
    $.get(friend.link, function(data) {
        const partner = parsePartner(data);
        callback(friend, partner);
    }).fail(function() {
        console.log(`${friend.link} failed`);
        incrementFriends();
    });
}

function parsePartner(data) {
    const relationSearch = '<div class="_2lzr _50f5 _50f7">';
    let linkSearchStart = data.indexOf(relationSearch);
    if(linkSearchStart !== -1) {
        linkSearchStart += relationSearch.length;
        const nameStop = data.indexOf('</a>', linkSearchStart);
        const nameStart = data.lastIndexOf('>', nameStop);
        const partnerName = data.substring(nameStart+1, nameStop);
        const partnerLinkSearch = 'href="';
        const partnerLinkStart = data.indexOf(partnerLinkSearch, linkSearchStart) + partnerLinkSearch.length;
        const partnerLink = data.substring(partnerLinkStart, data.indexOf('"', partnerLinkStart));
        return {'name':partnerName, 'link':partnerLink};
    } else {
        return undefined;
    }
}

function addPartnerToFriend(friend, partner) {
    friend.partner = partner;
    window.friends.push(friend);

    incrementFriends();
}

function incrementFriends() {
    window.currentFriendCount++;
    console.log(`${window.currentFriendCount} of ${window.maxFriendCount}`);
    if(window.currentFriendCount >= window.maxFriendCount) {
        const sortedFriends = window.friends.sort((f1,f2) => {
            const diff = f1.name.toLowerCase().localeCompare(f2.name.toLowerCase());
            if(diff !== 0) {
                return diff;
            } else {
                return f1.link.toLowerCase().localeCompare(f2.link.toLowerCase());
            }
        });
        const now = new Date();
        const data = {'timestamp':now,'friends':sortedFriends};
        download(JSON.stringify(data), 'friends.json');
    }
}

addUI();
