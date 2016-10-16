// ==UserScript==
// @name         Image download helper
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.1.3
// @description  Take selected image url's and download them to your PC.
// @author       Bakuzan
// @include      http*
// @exclude      http://localhost*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/polyfills/GM_download-polyfill.js
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/findWithAttr.js
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/pad.js
// @resource     stylesheet https://raw.githubusercontent.com/bakuzan/user-scripts/master/image-download-helper/image-download-helper.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    
	var cssTxt  = GM_getResourceText ("stylesheet");
	GM_addStyle (cssTxt);
	
    var body = document.body,
        CHECKBOX_ID_PREFIX = 'userscript-idh-download-checkbox-',
        CONTAINER_ID_PREFIX = 'userscript-idh-container-',
        downloads = [],
        extensions = ['.jpg', '.png', '.gif'],
		hasDownloadButtons = false,
        images = document.getElementsByTagName('img'),
        REGEX_EXTRACT_EXTENSION = /.*(?=\.)/g,
        REGEX_EXTRACT_NUMBER = /.*\w(-)/g;
    
    var controls = document.createElement('div'),
        downloadButton = document.createElement('input'),
        activateButton = document.createElement('input'),
        expandButton = document.createElement('div');
    
	controls.id = 'userscript-idh-controls';
	controls.style.left = '-100px';
    function toggleControls() {
        var showControls = controls.style.left === '-100px';
		controls.style.left = showControls ? '0' : '-100px';
    }
    
    downloadButton.id = 'userscript-idh-download-button';
    downloadButton.type = 'button';
	downloadButton.title = 'Download selected images';
    downloadButton.value = 'DL';
    downloadButton.addEventListener('click', processDownloads);
    
    activateButton.id = 'userscript-idh-add-checkboxes-button';
    activateButton.type = 'button';
	activateButton.title = 'Toggle checkboxes';
    activateButton.value = 'I/O';
    activateButton.addEventListener('click', addDownloadButtons);
    
    expandButton.id = 'userscript-idh-expand-button';
	expandButton.title = 'Toggle image controls';
    expandButton.textContent = '>>';
    expandButton.addEventListener('click', toggleControls);
    
    controls.appendChild(downloadButton);
    controls.appendChild(activateButton);
    controls.appendChild(expandButton);
    body.insertBefore(controls, body.firstChild);
	
    function createDownloadWrapper(i) {
		var container = document.createElement('span'),
		    checkbox = document.createElement('input');
        container.id = `${CONTAINER_ID_PREFIX}${i}`;
		
		checkbox.id = `${CHECKBOX_ID_PREFIX}${i}`;
		checkbox.type = 'checkbox';
		checkbox.addEventListener('click', toggleQueueDowload);
		container.appendChild(checkbox, container.firstChild);
        return container;
    }
	
	function toggleParentHref(parentAnchor) {
		var href = parentAnchor.getAttribute('href');
		if(href) {
			parentAnchor.setAttribute('userscript-idh-href', href);
			parentAnchor.removeAttribute('href');
		} else if (!href) {
			parentAnchor.setAttribute('href', parentAnchor.getAttribute('userscript-idh-href'));
		}
	}
    
    function addDownloadButtons() {
		if(!hasDownloadButtons) {
			for(var i = 0, length = images.length; i < length; i++) {
				var image = images[i],
					parent = image.parentNode,
					downloadWrapper = createDownloadWrapper(i);
				toggleParentHref(parent);
				parent.replaceChild(downloadWrapper, image);
				downloadWrapper.appendChild(image);
			}
			hasDownloadButtons = true;
		} else {
			for(var i = 0, length = images.length; i < length; i++) {
				var image = images[i],
					originalParent = image.parentNode.parentNode,
					checkbox = image.previousSibling;
				toggleParentHref(originalParent);
				checkbox.style.display = checkbox.style.display === 'none' ? 'block' : 'none';
			}
		}
    }
    
    function downloadImage(download) {
        var url = download.url,
            name = download.name;
        GM_download({
            url: url,
            name: name,
            header: {
                "Referer": window.host
            },
            onload: function(response){
                alert(`Downloaded ${name} successfully!`);
            },
            onerror: function(){
                alert(`Download of ${name} failed!\n${url}`);
            }
        });
    }
    
    function toggleQueueDowload(event) {
		event.stopPropagation();
		var target = event.target,
		    id = target.id,
            imageSrc = target.nextSibling.src,
            extension = imageSrc.replace(REGEX_EXTRACT_EXTENSION, ''),
			index = findWithAttr(downloads, 'url', imageSrc);
        extension = extensions.indexOf(extension) === -1 ? '.jpg' : extension;
		if(target.checked && index === -1) downloads.push({ url: imageSrc, name: `${pad(id.replace(REGEX_EXTRACT_NUMBER, ''), 3)}${extension}` });
		if(!target.checked && index > -1) downloads.splice(index, 1);
    }
    
    function processDownloads() {
        var count = downloads.length;
        while(count--) {
            downloadImage(downloads[count]);
        }
    }
    
})();
