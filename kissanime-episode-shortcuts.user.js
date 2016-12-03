// ==UserScript==
// @name         Kissanime episode shortcuts
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.4.1
// @description  Some conveinent keyboard shortcuts for kissanime episode pages.
// @author       Bakuzan
// @include      http://kissanime.to/Anime/*/*?id=*
// @include		 *googlevideo.com*
// @include		 *.mp4
// @include		 *.webm
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var body = document.body,
        EPISODE_TRIM_REGEX = /\/(?=[^\/]*$).*/,
        firstClickOnKissAnime = window.location.host === 'kissanime.to',
		FULLSCREEN_KEY_CODE = 70,	// f
        HOME_KEY_CODE = 192,		// '@
        INTRO_KEY_CODE = 73,		// i
		NEXT_ID = 'btnNext',
        NEXT_KEY_CODE = 190,		// .>
		PLAY_KEY_CODE = 32,			// SAPCEBAR
        PREV_ID = 'btnPrevious',
        PREV_KEY_CODE = 188, 		// ,<
		SEEK_BACKWARD_KEY = 220,	// \|
		SEEK_FORWARD_KEY = 191,		// /?
		SEEK_INTRO_SKIP = 90,
		SEEK_LARGE_CHANGE = 30,
		SEEK_NORMAL_CHANGE = 10,
		SEEK_SMALL_CHANGE = 5,
		video = document.getElementById('my_video_1_html5_api');
	
	if(video === null) {
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
		if (video.requestFullscreen) return video.displayingFullscreen ? video.exitFullscreen() : video.requestFullscreen();
		if (video.mozRequestFullScreen) return video.mozDisplayingFullscreen ? video.mozExitFullscreen() : video.mozRequestFullScreen();
		if (video.webkitRequestFullscreen) return document.webkitIsFullScreen ? document.webkitCancelFullScreen() : video.webkitRequestFullscreen();
	}
	
	function seekToPoint(moveInSeconds) {
		var seekToTime = video.currentTime + moveInSeconds;
		if (seekToTime < 0 || seekToTime > video.duration) seekToTime = 0;
		video.currentTime = seekToTime;
	}
    
    function togglePlay() {
        return video.paused ? video.play() : video.pause();
    }
    
    function performClickOnElementById(id) {
        document.getElementById(id).click();
    }
	
	function shortcutHandler(event) {
		event.preventDefault();
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
            if (video !== document.activeElement) video.focus();
            if (!firstClickOnKissAnime) togglePlay();
            firstClickOnKissAnime = false;
            video.blur();
        } else if (ctrlKey && shiftKey && keyCode === FULLSCREEN_KEY_CODE) {
		    toggleFullscreenMode();
		} else if (ctrlKey && keyCode === INTRO_KEY_CODE) {
			seekToPoint(SEEK_INTRO_SKIP)
	    } else if (keyCode === SEEK_FORWARD_KEY) {
			if (ctrlKey && shiftKey) return seekToPoint(SEEK_LARGE_CHANGE);
			if (ctrlKey) return seekToPoint(SEEK_NORMAL_CHANGE);
			return seekToPoint(SEEK_SMALL_CHANGE);
		} else if (keyCode === SEEK_BACKWARD_KEY) {
			if (ctrlKey && shiftKey) return seekToPoint(-SEEK_LARGE_CHANGE);
			if (ctrlKey) return seekToPoint(-SEEK_NORMAL_CHANGE);
			return seekToPoint(-SEEK_SMALL_CHANGE);
		}
    }
    
    body.addEventListener('keydown', shortcutHandler);
})();