// ==UserScript==
// @name         Image download helper
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.1.0
// @description  Take selected image url's and download them to your PC.
// @author       Bakuzan
// @include      http*
// @exclude      http://localhost*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/GM_download-polyfill.js
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/findWithAttr.js
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/pad.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    
    var body = document.body,
        buttonCssText = `
         width: 50px;
         height: 32px;
        `,
        CHECKBOX_ID_PREFIX = 'userscript-idh-download-checkbox-',
        CONTAINER_ID_PREFIX = 'userscript-idh-container-',
        controlsConstantCssText = `
         position: fixed;
         bottom: 0;
         width: 117px;
         height: 32px;
		 background: #fff;
		 color: #aaa;
		 border-top-right-radius: 10px;
		 font-size: 13px;
		 font-weight: bold;
		 font-family: Arial,Helvetica,sans-serif;
		 text-align: center;
         z-index: 1000;
        `,
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
	controls.style.cssText = `${controlsConstantCssText} left: -100px;`;
    function toggleControls() {
        var showControls = controls.style.left === '-100px';
		controls.style.left = showControls ? '0' : '-100px';
    }
    
    downloadButton.id = 'userscript-idh-download-button';
    downloadButton.type = 'button';
	downloadButton.title = 'Download selected images';
    downloadButton.value = 'DL';
    downloadButton.style.cssText = buttonCssText;
    downloadButton.addEventListener('click', processDownloads);
    
    activateButton.id = 'userscript-idh-add-checkboxes-button';
    activateButton.type = 'button';
	activateButton.title = 'Toggle checkboxes';
    activateButton.value = 'I/O';
    activateButton.style.cssText = buttonCssText;
    activateButton.addEventListener('click', addDownloadButtons);
    
    expandButton.id = 'userscript-idh-expand-button';
	expandButton.title = 'Toggle image controls';
    expandButton.textContent = '>>';
    expandButton.style.cssText = `
     display: inline-block;
     width: 15px;
     height: 30px;
     background: #fff;
	 border: 1px solid #aaa;
	 border-top-right-radius: 10px;
	 line-height: 30px;
	 cursor: pointer;
    `;
    expandButton.addEventListener('click', toggleControls);
    
    controls.appendChild(downloadButton);
    controls.appendChild(activateButton);
    controls.appendChild(expandButton);
    body.insertBefore(controls, body.firstChild);
	
    function createDownloadWrapper(i) {
		var container = document.createElement('span'),
		    checkbox = document.createElement('input');
        container.id = `${CONTAINER_ID_PREFIX}${i}`;
		container.style.cssText = `
		 position: relative;
         display: block;
		`;
		
		checkbox.id = `${CHECKBOX_ID_PREFIX}${i}`;
		checkbox.type = 'checkbox';
        checkbox.style.cssText = `
         position: absolute;
         top: 0;
         right: 0;
         width: 10px;
         height: 10px;
         margin: 0;
         border: 1px solid #aaa;
         cursor: pointer;
		 z-index: 1000;
        `;
		checkbox.addEventListener('click', toggleQueueDowload);
		container.appendChild(checkbox, container.firstChild);
        return container;
    }
    
    function addDownloadButtons() {
		if(!hasDownloadButtons) {
			for(var i = 0, length = images.length; i < length; i++) {
				var image = images[i],
					parent = image.parentNode,
					downloadWrapper = createDownloadWrapper(i);
				parent.replaceChild(downloadWrapper, image);
				downloadWrapper.appendChild(image);
			}
			hasDownloadButtons = true;
		} else {
			for(var i = 0, length = images.length; i < length; i++) {
				var image = images[i],
					checkbox = image.previousSibling;
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
