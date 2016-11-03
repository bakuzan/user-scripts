// ==UserScript==
// @name         Kissanime episode shortcuts
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.0.3
// @description  Some conveinent keyboard shortcuts for kissanime episode pages.
// @author       Bakuzan
// @include      http://kissanime.to/anime/*/episode-*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var body = document.body,
        EPISODE_TRIM_REGEX = /\/(?=[^\/]*$).*/,
        HOME_KEY_CODE = 192,
        NEXT_ID = '',
        NEXT_KEY_CODE = 190,
        PREV_ID = '',
        PREV_KEY_CODE = 188;
    
    function goToSeriesEpisodeList() {
        var currentPage = window.location.href;
        window.location.href = currentPage.replace(EPISODE_TRIM_REGEX, '');
    }
    
    function performClickOnElementById(id) {
        document.getElementById(id).click();
    }
    
    body.addEventListener('keydown', function(event) {
        var keyCode = event.which;
        if(keyCode === NEXT_KEY_CODE) {
            performClickOnElementById(NEXT_ID);
        } else if (keyCode === PREV_KEY_CODE) {
            performClickOnElementById(PREV_ID);
        } else if (keyCode === HOME_KEY_CODE) {
            goToSeriesEpisodeList();
        }
    });
})();
