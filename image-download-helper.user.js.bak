// ==UserScript==
// @name         Image download helper
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.1.0
// @description  Take selected image url's and download them to your PC.
// @author       Bakuzan
// @include      http*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/GM_download-polyfill.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    
    var body = document.body,
        buttonCssText = `
         width: 50px;
         height: 20px;
        `,
        CHECKBOX_ID_PREFIX = 'userscript-idh-download-checkbox-',
        CONTAINER_ID_PREFIX = 'userscript-idh-container-',
        controlsConstantCssText = `
         position: fixed;
         bottom: 0;
         width: 110px;
         height: 20px;
         z-index: 1000;
        `,
        downloads = [],
        extensions = ['.jpg', '.png', '.gif'],
        images = document.getElementsByTagName('img'),
        REGEX_EXTRACT_EXTENSION = /.*(?=\.)/g,
        REGEX_EXTRACT_NUMBER = /.*\w(-)/g;
    
    var controls = document.createElement('div'),
        downloadButton = document.createElement('input'),
        activateButton = document.createElement('input'),
        expandButton = document.createElement('span');
    
    function toggleControls(forceControlState) {
        var showControls = controls.style.left === '-100px' || forceControlState;
        if(showControls) controls.style.cssText = `${controlsConstantCssText} left: 0;`;
        if(!showControls) controls.style.cssText = `${controlsConstantCssText} left: -100px;`;
    }
    toggleControls(false);
    
    downloadButton.id = 'userscript-idh-download-button';
    downloadButton.type = 'button';
    downloadButton.textContent = 'DL';
    downloadButton.style.cssText = buttonCssText;
    downloadButton.addEventListener('click', processDownloads);
    
    activateButton.id = 'userscript-idh-add-checkboxes-button';
    activateButton.type = 'button';
    downloadButton.textContent = 'Start';
    activateButton.style.cssText = buttonCssText;
    activateButton.addEventListener('click', addDownloadButtons);
    
    expandButton.id = 'userscript-idh-expand-button';
    expandButton.textContent = '>>';
    expandButton.style.cssText = `
     display: inline-block;
     width: 10px;
     height: 20px;
     background: #fff;
    `;
    expandButton.addEventListener('click', toggleControls);
    
    controls.appendChild(downloadButton);
    controls.appendChild(activateButton);
    controls.appendChild(expandButton);
    body.insertBefore(controls, body.firstChild);
	
	function pad(number, width, padChar) {
	  padChar = padChar || '0';
	  number = number + '';
	  return number.length >= width ? number : new Array(width - number.length + 1).join(padChar) + number;
	}
    
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
		container.appendChild(checkbox, container.firstChild);
        return container;
    }
    
    function addDownloadButtons() {
        for(var i = 0, length = images.length; i < length; i++) {
            var image = images[i],
				parent = image.parentNode,
                downloadWrapper = createDownloadWrapper(i);
			parent.replaceChild(downloadWrapper, image);
			downloadWrapper.appendChild(image);
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
    
    function queueDowload(element) {
        if(element === null) return;
		var id = element.id,
            imageSrc = element.nextSibling.src,
            extension = imageSrc.replace(REGEX_EXTRACT_EXTENSION, '');
        extension = extensions.indexOf(extension) === -1 ? '' : extension;
		if(element.checked) downloads.push({ url: imageSrc, name: `${pad(id.replace(REGEX_EXTRACT_NUMBER, ''), 3)}${extension}` });
    }
    
    function processDownloads() {
        for(var i = 0, length = images.length; i < length; i++) {
            var image = images[i],
                checkbox = image.previousSibling;
            queueDowload(checkbox);
        }
        var count = downloads.length;
        while(count--) {
            downloadImage(downloads[count]);
        }
    }
    
})();
