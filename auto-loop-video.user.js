// ==UserScript==
// @name        Auto loop video
// @namespace   sc4r4b@toshi
// @author      Bakuzan
// @description Automatically enables looping on Webm videos.
// @include		https://gfycat.com/*
// @include     file:///*
// @include     *.webm
// @run-at      document-start
// @version     0.1
// ==/UserScript==

(function() {
    'use strict';
    
    var vids = document.getElementsByTagName('video');
    for (var i = 0, len = vids.length; i < len; i++) {
        vids[i].setAttribute('loop', 'true');
    }
    
})();