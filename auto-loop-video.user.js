// ==UserScript==
// @name        Auto loop video
// @namespace   https://github.com/bakuzan/user-scripts
// @author      Bakuzan
// @description Automatically enables looping on Webm videos.
// @noframes
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
