// ==UserScript==
// @name         Video controls
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.0.6
// @description  Provide various controls for html5 video.
// @author       Bakuzan
// @include      http*
// @include      *.mp4
// @include      *.webm
// @exclude      *drive.google.com/*
// @exclude      *youtube*
// @require	     https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/wrapElementWithNewParent.js
// @require	     https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @resource     stylesheet https://raw.githubusercontent.com/bakuzan/user-scripts/master/video-controls/video-controls.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';
	if (window.top !== window.self) return;
	
	const cssTxt  = GM_getResourceText ("stylesheet");
	GM_addStyle (cssTxt);
	
	const body = document.body;
	const NEW_TAB_BUTTON_ID_PREFIX = 'userscript-ontv-button-';
	const NEW_TAB_BUTTON_CLASS = 'userscript-ontv-button';
	const NEW_TAB_CONTAINER_ID_PREFIX = 'userscript-ontv-container-';
	const NEW_TAB_CONTAINER_CLASS = 'userscript-ontv-container';
	const onPlayButton = buildElement('input', { id: `${NEW_TAB_BUTTON_ID_PREFIX.slice(0, -1)}`, className: 'userscript-ontv-transition', type: 'button', value: 'Open video in new tab?' });
	const PREVENT_SHOW_ON_PLAY_WINDOW = 10;
	const TRANSITION_CLASS = 'userscript-ontv-transition';
	
	const FULLSCREEN_KEY_CODE = 70;	// f
	const INTRO_KEY_CODE = 73;		// i
	const PLAY_KEY_CODE = 32;		// SAPCEBAR
	const SEEK_BACKWARD_KEY = 220;	// \|
	const SEEK_FORWARD_KEY = 191;	// /?
	const SEEK_INTRO_SKIP = 90;
	const SEEK_LARGE_CHANGE = 30;
	const SEEK_NORMAL_CHANGE = 10;
	const SEEK_SMALL_CHANGE = 5;
	
	const videos = document.getElementsByTagName('video');	
	if(!videos.length) return;
	
	const onPlayOpenInNewTab = (event) => {
		const target = event.target;
		window.open(target.getAttribute('video-link'), '_blank');
	};
	
	onPlayButton.addEventListener('click', onPlayOpenInNewTab);
	body.appendChild(onPlayButton);
	
	class VideoControlShortcuts {
		constructor(videoElement) {
			this.video = videoElement;
			body.addEventListener('keydown', (e) => { this.shortcutHandler(e); });
		}
		toggleFullscreenMode(video) {
			if (this.video.requestFullscreen) return this.video.displayingFullscreen ? this.video.exitFullscreen() : this.video.requestFullscreen();
			if (this.video.mozRequestFullScreen) return this.video.mozDisplayingFullscreen ? this.video.mozExitFullscreen() : this.video.mozRequestFullScreen();
			if (this.video.webkitRequestFullscreen) return document.webkitIsFullScreen ? document.webkitCancelFullScreen() : this.video.webkitRequestFullscreen();
		}
		seekToPoint(moveInSeconds) {
			let seekToTime = this.video.currentTime + moveInSeconds;
			if (seekToTime < 0 || seekToTime > this.video.duration) seekToTime = 0;
			this.video.currentTime = seekToTime;
		}
		togglePlay() {
			return this.video.paused ? this.video.play() : this.video.pause();
		}
		shortcutHandler(event) {
			event.preventDefault();
			const keyCode = event.which;
			const ctrlKey = event.ctrlKey;
			const shiftKey = event.shiftKey;
			if(keyCode === PLAY_KEY_CODE) {
				if (this.video !== document.activeElement) this.video.focus();
				this.togglePlay();
				this.video.blur();
			} else if (ctrlKey && shiftKey && keyCode === FULLSCREEN_KEY_CODE) {
				this.toggleFullscreenMode();
			} else if (ctrlKey && keyCode === INTRO_KEY_CODE) {
				this.seekToPoint(SEEK_INTRO_SKIP);
			} else if (keyCode === SEEK_FORWARD_KEY) {
				if (ctrlKey && shiftKey) return this.seekToPoint(SEEK_LARGE_CHANGE);
				if (ctrlKey) return this.seekToPoint(SEEK_NORMAL_CHANGE);
				return this.seekToPoint(SEEK_SMALL_CHANGE);
			} else if (keyCode === SEEK_BACKWARD_KEY) {
				if (ctrlKey && shiftKey) return this.seekToPoint(-SEEK_LARGE_CHANGE);
				if (ctrlKey) return this.seekToPoint(-SEEK_NORMAL_CHANGE);
				return this.seekToPoint(-SEEK_SMALL_CHANGE);
			}
		}
	}
	
	class VideoControls {
		constructor(number, videoElement) {
			this.index = number;
			this.video = videoElement;
			
			this.init();
		}
		init() {
			const openInNewTabButton = this.createOpenInNewTabButton(this.index, this.video);
			this.video.addEventListener('play', (e) => { this.showOnPlayButton(e); });
			/*
			 *	Wrapping a new parent causes layout issues.
			 *	Need to find RELIABLE way to place button near associated video.
			*/
			//wrapElementWithNewParent(openInNewTabButton, this.video);
		}
		createOpenInNewTabButton(index, video) {
			if(!video.paused) video.pause();
			const container = buildElement('div', { id: `${NEW_TAB_CONTAINER_ID_PREFIX}${index}`, className: NEW_TAB_CONTAINER_CLASS });
			const newTabButton = buildElement('input', { id: `${NEW_TAB_BUTTON_ID_PREFIX}${index}`, className: NEW_TAB_BUTTON_CLASS, type: 'button', value: 'View video' });

			newTabButton.addEventListener('click', this.openVideoInNewTab);
			
			container.appendChild(newTabButton);
			return container;
		}
		openVideoInNewTab(event) {
			window.open(this.video.getAttribute('src') || this.video.firstChild.getAttribute('src'), '_blank');
		}
		showOnPlayButton(event) {
			if(this.video.currentTime > PREVENT_SHOW_ON_PLAY_WINDOW) return;
			onPlayButton.style.cssText = 'opacity: 1; height: 50px';
			onPlayButton.setAttribute('video-link', this.video.getAttribute('src') || this.video.firstChild.getAttribute('src'));
			setTimeout(() => {
				onPlayButton.style.cssText = 'opacity: 0; height: 0';
			}, 5000);
		}
	}
	
	(function() {
		let controllers = [];
		let videoShortcuts;
		const length = videos.length;
		for(let i = 0; i < length; i++) {
			const video = videos[i];
			controllers.push(new VideoControls(i, video));
			videoShortcuts = new VideoControlShortcuts(video);
		}
	})();

})();
