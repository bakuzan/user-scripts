// ==UserScript==
// @name        Loop video
// @namespace   https://github.com/bakuzan/user-scripts
// @author      Bakuzan
// @description Automatically enables looping on Webm videos and provides context menu option to toggle loop for any html5 video tag.
// @include		https://gfycat.com/*
// @include     file:///*
// @include     *.webm
// @run-at      document-start
// @version     0.1.1
// ==/UserScript==

(function() {
    'use strict';
    
    var TARGET_NAME = 'userscript-loop-video',
		ATTRIBUTE_NAME = 'videoClass',
		body = document.body;
    body.addEventListener('contextmenu', initMenu, false);
    var menu = body.appendChild(document.createElement('menu'));
    
    var videos = document.getElementsByTagName('video');
    for (var i = 0, len = vids.length; i < len; i++) {
        videos[i].setAttribute('loop', 'true');
    }

    menu.outerHTML = `<menu id="${TARGET_NAME}" type="context">
                       <menuitem type="checkbox" checked="true" label="Loop html5 video"></menuitem>
                      </menu>`;

    document.querySelector(`#${TARGET_NAME} menuitem`).addEventListener('click', toggleLoop, false);

    function initMenu(aEvent) {
        var node = aEvent.target;
        var item = document.querySelector(`#${TARGET_NAME} menuitem`);

        if (node.localName === 'video') {
            body.setAttribute('contextmenu', TARGET_NAME);
	    	addTargetName(node);
	    	setIcon(item, node);
        } else {
            body.removeAttribute('contextmenu');
	    	removeTargetName();
        }
    }
	
	function setIcon(item, node) {
	    item.setAttribute('checked', node.getAttribute('loop'));
	}
	
	function addTargetName(node) {
		node.classList.add(TARGET_NAME);
	}
	
	function removeTargetName() {
		var targets = document.getElementsByClassName(TARGET_NAME);
		for(var i = 0, len = targets.length; i < len; i++) {
			targets[i].classList.remove(TARGET_NAME);
		}
	}
    
    function toggleLoop(aEvent) {
		var targets = document.getElementsByClassName(TARGET_NAME),
			target = targets[0],
			isLooping = !(target.getAttribute('loop') === "true");
        if(isLooping) target.setAttribute('loop', "true");
		if(!isLooping) target.removeAttribute('loop');
		removeTargetName();
    }
    
})();
