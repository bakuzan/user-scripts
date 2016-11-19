// ==UserScript==
// @name         Open new tab video
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.0.32
// @description  Allow you to open a video in a new tab.
// @author       Bakuzan
// @include      http*
// @exclude      http://localhost:*
// @exclude		 *://gfycat.com/*
// @exclude		 *googlevideo.com*
// @require		 https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/wrapElementWithNewParent.js
// @require		 https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
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
		onPlayButton = buildElement('input', { id: `${NEW_TAB_BUTTON_ID_PREFIX.slice(0, -1)}`, className: 'userscript-ontv-transition', type: 'button', value: 'Open video in new tab?' }),
		TRANSITION_CLASS = 'userscript-ontv-transition';
	
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
		if(!video.paused) video.pause();
		var container = buildElement('div', { id: `${NEW_TAB_CONTAINER_ID_PREFIX}${index}`, className: NEW_TAB_CONTAINER_CLASS });
		var newTabButton = buildElement('input', { id: `${NEW_TAB_BUTTON_ID_PREFIX}${index}`, className: NEW_TAB_BUTTON_CLASS, type: 'button', value: 'View video' });

		newTabButton.addEventListener('click', openVideoInNewTab);
		
		container.appendChild(newTabButton);
		return container;
	}
	
	function receiveMessageFromFrame(event) {
		console.log('from event: ', event);
		var message = event.data;
	}
	
	function sendMessageFromAnIframe(event) {
		var target = event.target;
		window.top.postMessage(target.getAttribute('src') || target.firstChild.getAttribute('src'), window.top.location.origin);
	}
	
	if (window.top === window.self) {
		var cssTxt  = GM_getResourceText ("stylesheet");
		GM_addStyle (cssTxt);
		
		var videos = document.getElementsByTagName('video');	
		if(!videos.length) return;
		
		(function() {
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
	/*
		(function(open){
            XMLHttpRequest.prototype.open = function () {
                console.log('cept open : ', this, arguments);
                this.addEventListener('readystatechange', function () {
                    if(this.readyState === 4) {
                        console.log('4 : ', this, arguments);
                    }
                }, false);
                open.call(this, arguments);
            };
        })(XMLHttpRequest.prototype.open);
	*/	
		var videos = document.getElementById('video');
		for(var i = 0, length = videos.length; i < length; i++) {
			var video = videos[i];
			video.addEventListener('play', sendMessageFromAnIframe);
		}
		
		var flashVars = document.querySelectorAll('object[type="application/x-shockwave-flash"] > param[name="flashvars"]');
		for(var i = 0, length = flashVars.length; i < length; i++) {
			var param = flashVars[i],
				file = param.value.match(/file=(.*?)(?:&)/g);
			console.log(file);
		}
	}
})();
