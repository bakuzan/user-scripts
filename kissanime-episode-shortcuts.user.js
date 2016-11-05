// ==UserScript==
// @name         Kissanime episode shortcuts
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.1.16
// @description  Some conveinent keyboard shortcuts for kissanime episode pages.
// @author       Bakuzan
// @include      http://kissanime.to/Anime/*/Episode-*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var body = document.body,
        EPISODE_TRIM_REGEX = /\/(?=[^\/]*$).*/,
		FULLSCREEN_KEY_CODE = 70,	// f
        HOME_KEY_CODE = 192,		// '@
        NEXT_ID = 'btnNext',
        NEXT_KEY_CODE = 190,		// .>
		PLAY_KEY_CODE = 32,  		// SPACEBAR
        PREV_ID = 'btnPrevious',
        PREV_KEY_CODE = 188, 		// ,<
		video = document.getElementById('my_video_1_html5_api');
    
    function goToSeriesEpisodeList() {
        var currentPage = window.location.href;
        window.location.href = currentPage.replace(EPISODE_TRIM_REGEX, '');
    }
	
	function toggleFullscreenMode() {
		if (video.requestFullscreen) {
		  return video.displayingFullscreen ? video.exitFullscreen() : video.requestFullscreen();
		} else if (video.mozRequestFullScreen) {
		  return video.mozDisplayingFullscreen ? video.mozExitFullscreen() : video.mozRequestFullScreen();
		} else if (video.webkitRequestFullscreen) {
		  return document.webkitIsFullScreen ? document.webkitCancelFullScreen() : video.webkitRequestFullscreen();
		}
	}
	
	function togglePlayVideo() {
		var isPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
		console.log('play? : ', isPlaying, isPlaying ? 'pause' : 'play');
		return isPlaying ? video.pause() : video.play();
	}
    
    function performClickOnElementById(id) {
        document.getElementById(id).click();
    }
	
	function shortcutHandler(event) {
		event.preventDefault();
        var keyCode = event.which,
			ctrlKey = event.ctrlKey,
			shiftKey = event.shiftKey;
        if(keyCode === NEXT_KEY_CODE) {
            performClickOnElementById(NEXT_ID);
        } else if (keyCode === PREV_KEY_CODE) {
            performClickOnElementById(PREV_ID);
        } else if (keyCode === HOME_KEY_CODE) {
            goToSeriesEpisodeList();
        } else if (keyCode === PLAY_KEY_CODE) {
			togglePlayVideo();
		} else if (ctrlKey && shiftKey && keyCode === FULLSCREEN_KEY_CODE) {
		    toggleFullscreenMode();
	    }
    }
    
    body.addEventListener('keydown', shortcutHandler);
})();
