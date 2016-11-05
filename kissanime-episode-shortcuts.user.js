// ==UserScript==
// @name         Kissanime episode shortcuts
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.2.7
// @description  Some conveinent keyboard shortcuts for kissanime episode pages.
// @author       Bakuzan
// @include      http://kissanime.to/Anime/*/Episode-*
// @include		 *googlevideo.com*
// @include		 file:///*.mp4
// @include		 file:///*.webm
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
		PLAY_KEY_CODE = 32,			// SAPCEBAR
        PREV_ID = 'btnPrevious',
        PREV_KEY_CODE = 188, 		// ,<
		SEEK_BACKWARD_KEY = 37,		// LEFT ARROW
		SEEK_FORWARD_KEY = 39,		// RIGHT ARROW
		video = document.getElementById('my_video_1_html5_api');
	
	if(video === undefined) {
		video = document.getElementsByTagName('video')[0];
		if(video === undefined) return;
	} else {
		document.getElementsByClassName('vjs-control-bar')[0].style.display = 'none';
		video.setAttribute('controls', true);
	}
    
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
	
	function seekToPoint(moveInSeconds) {
		var seekToTime = video.currentTime + moveInSeconds;
		if (seekToTime < 0 || seekToTime > video.duration) seekToTime = 0;
		video.currentTime = seekToTime;
	}
    
    function performClickOnElementById(id) {
        document.getElementById(id).click();
    }
	
	function shortcutHandler(event) {
        var keyCode = event.which,
			ctrlKey = event.ctrlKey,
			shiftKey = event.shiftKey;
        if (keyCode === NEXT_KEY_CODE) {
            performClickOnElementById(NEXT_ID);
        } else if (keyCode === PREV_KEY_CODE) {
            performClickOnElementById(PREV_ID);
        } else if (keyCode === HOME_KEY_CODE) {
            goToSeriesEpisodeList();
		} else if(keyCode === PLAY_KEY_CODE) { 
			event.preventDefault(); 
			video.focus();
        } else if (ctrlKey && shiftKey && keyCode === FULLSCREEN_KEY_CODE) {
		    toggleFullscreenMode();
	    } else if (ctrlKey && shiftKey && keyCode === SEEK_FORWARD_KEY) {
			seekToPoint(10);
		} else if (ctrlKey && shiftKey && keyCode === SEEK_BACKWARD_KEY) {
			seekToPoint(-10);
		}
    }
    
    body.addEventListener('keydown', shortcutHandler);
})();
