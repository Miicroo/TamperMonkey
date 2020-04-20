// ==UserScript==
// @name         Huawei b525 show DNS
// @namespace    https://github.com/Miicroo/TamperMonkey/tree/master/huawei-b525
// @version      1.0.0
// @description  Show DNS statistics for huawei b525
// @author       Miicroo
// @match        http://192.168.1.1/html/dhcp.html
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

$('#dhcp_dns_statistic').show();
$('#dhcp_primary_dns').show();
$('#dhcp_secondary_dns').show();
