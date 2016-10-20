// ==UserScript==
// @name         Open new tab video
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.0.1
// @description  Allow you to open a video in a new tab.
// @author       Bakuzan
// @include      http*
// @exclude      http://localhost:*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //As a start handle html5 videos.
    var NEW_TAB_BUTTON_ID_PREFIX = 'userscript-ontv-button-',
        NEW_TAB_CONTAINER_ID_PREFIX = 'userscript-ontv-container-',
        videos = document.getElementsByTagName('video');
    
    if(!videos.length) return;
    
    function wrapElementWithNewParent(newParent, child) {
        child.parentNode.replaceChild(newParent, child);
        newParent.appendChild(child);
    }
    
    function openVideoInNewTab(event) {
        var target = event.target;
        window.open(target.getAttribute('video-src'), '_blank');
        console.log('open video: ', event);
    }
    
    function createOpenInNewTabButton(index, video) {
        var container = document.createElement('span');
        container.id = `${NEW_TAB_CONTAINER_ID_PREFIX}${index}`;
        
        var newTabButton = document.createElement('button');
        newTabButton.id = `${NEW_TAB_BUTTON_ID_PREFIX}${index}`;
        newTabButton.value = 'Open in new tab';
        newTabButton.setAttribute('video-src', video.src);
        newTabButton.addEventListener('click', openVideoInNewTab);
        
        container.appendChild(newTabButton);
        return container;
    }
    
    for(var i = 0, length = videos.length; i < length; i++) {
        var video = videos[i],
            openInNewTabButton = createOpenInNewTabButton(i, video);
        wrapElementWithNewParent(openInNewTabButton, video);
    }
})();
