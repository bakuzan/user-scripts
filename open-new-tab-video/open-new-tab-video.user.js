// ==UserScript==
// @name         Open new tab video
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.0.20
// @description  Allow you to open a video in a new tab.
// @author       Bakuzan
// @include      http*
// @exclude      http://localhost:*
// @exclude		 *://gfcat.com/*
// @resource     stylesheet https://raw.githubusercontent.com/bakuzan/user-scripts/master/open-new-tab-video/open-new-tab-video.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';
	
	var body = document.body,
		NEW_TAB_BUTTON_ID_PREFIX = 'userscript-ontv-button-',
		NEW_TAB_BUTTON_CLASS = 'userscript-ontv-button',
		NEW_TAB_CONTAINER_ID_PREFIX = 'userscript-ontv-container-',
		NEW_TAB_CONTAINER_CLASS = 'userscript-ontv-container',
		onPlayButton = document.createElement('input'),
		TRANSITION_CLASS = 'userscript-ontv-transition';
	
	function wrapElementWithNewParent(newParent, child) {
		child.parentNode.replaceChild(newParent, child);
		newParent.appendChild(child);
	}
	
	function onPlayOpenInNewTab(event) {
		var target = event.target;
		window.open(target.getAttribute('video-link'), '_blank');
	}
	
	function openVideoInNewTab(event) {
		var target = event.target,
			video = target.parentNode.getElementsByTagName('video')[0];
		window.open(video.getAttribute('src') || video.firstChild.getAttribute('src'), '_blank');
	}
	
	function showOnPlayButton(event) {
		var target = event.target;
		onPlayButton.style.cssText = 'opacity: 1; height: 50px';
		onPlayButton.setAttribute('video-link', target.getAttribute('src') || target.firstChild.getAttribute('src'));
		setTimeout(function() {
			onPlayButton.style.cssText = 'opacity: 0; height: 0';
		}, 5000);
	}
	
	function createOpenInNewTabButton(index, video) {
		var container = document.createElement('div');
		container.id = `${NEW_TAB_CONTAINER_ID_PREFIX}${index}`;
		container.className = NEW_TAB_CONTAINER_CLASS;
		
		var newTabButton = document.createElement('input');
		newTabButton.id = `${NEW_TAB_BUTTON_ID_PREFIX}${index}`;
		newTabButton.className = NEW_TAB_BUTTON_CLASS;
		newTabButton.type = 'button';
		newTabButton.value = 'View video';
		newTabButton.addEventListener('click', openVideoInNewTab);
		
		container.appendChild(newTabButton);
		return container;
	}
	
	function receiveMessageFromFrame(event) {
		console.log('from event: ', event);
		var message = event.data;
	}
	
	function sendMessageFromAnIframe(message) {
		window.top.postMessage(message, window.top.location.origin);
	}
	
	if (window.top === window.self) {
		var cssTxt  = GM_getResourceText ("stylesheet");
		GM_addStyle (cssTxt);
		
		var videos = document.getElementsByTagName('video');	
		if(!videos.length) return;
		
		(function() {
			onPlayButton.id = `${NEW_TAB_BUTTON_ID_PREFIX.slice(0, -1)}`;
			onPlayButton.className = 'userscript-ontv-transition';
			onPlayButton.type = 'button';
			onPlayButton.value = 'Open video in new tab?';
			onPlayButton.addEventListener('click', onPlayOpenInNewTab);
			body.appendChild(onPlayButton);
			
			for(var i = 0, length = videos.length; i < length; i++) {
				var video = videos[i],
					openInNewTabButton = createOpenInNewTabButton(i, video);
				video.addEventListener('play', showOnPlayButton);
				wrapElementWithNewParent(openInNewTabButton, video);
			}
			window.addEventListener('message', receiveMessageFromFrame, false);
		})();
	} else {
		
		(function(open) {
			window.XMLHttpRequest.prototype.open = function() {
				this.addEventListener('readystatechange', function() {
					console.log('xmlhttprequest open: ', this, this.getResponseHeader('content-type'), arguments);
				}, false);
				open.apply(this, arguments);
			};
		})(window.XMLHttpRequest.prototype.open);
	}
})();
