// ==UserScript==
// @name         Kissanime episode shortcuts
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.1.0
// @description  Some conveinent keyboard shortcuts for kissanime episode pages.
// @author       Bakuzan
// @include      http://kissanime.to/Anime/*/Episode-*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var body = document.body,
        EPISODE_TRIM_REGEX = /\/(?=[^\/]*$).*/,
        HOME_KEY_CODE = 192,
        NEXT_ID = 'btnNext',
        NEXT_KEY_CODE = 190,
		PLAY_KEY_CODE = 32,
        PREV_ID = 'btnPrevious',
        PREV_KEY_CODE = 188,
		video = document.getElementById('my_video_1_html5_api');
    
    function goToSeriesEpisodeList() {
        var currentPage = window.location.href;
        window.location.href = currentPage.replace(EPISODE_TRIM_REGEX, '');
    }
	
	function togglePlayVideo() {
		video.paused ? video.play() : video.pause();
	}
    
    function performClickOnElementById(id) {
        document.getElementById(id).click();
    }
    
    body.addEventListener('keydown', function(event) {
		event.preventDefault();
        var keyCode = event.which;
        if(keyCode === NEXT_KEY_CODE) {
            performClickOnElementById(NEXT_ID);
        } else if (keyCode === PREV_KEY_CODE) {
            performClickOnElementById(PREV_ID);
        } else if (keyCode === HOME_KEY_CODE) {
            goToSeriesEpisodeList();
        } else if (keyCode === PLAY_KEY_CODE) {
			togglePlayVideo();
		}
    });
})();
