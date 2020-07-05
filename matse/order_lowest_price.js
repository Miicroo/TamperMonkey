// ==UserScript==
// @name         Sort mat.se price low-high
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/matse
// @version      1.0.0
// @description  Mat.se: Sort price low-high
// @author       Miicroo
// @match        https://www.mat.se/search.html*
// @grant        none
// ==/UserScript==

const hasSearchQuery = window.location.href.indexOf('?') !== -1;
const hasSortOrder = window.location.href.indexOf('sortOrder') !== -1;

if (hasSearchQuery && !hasSortOrder) {
    window.location.href += `&sortOrder=Jfr%20Pris%20lågt-högt`;
}
