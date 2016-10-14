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
    
    var CHECKBOX_ID_PREFIX = 'userscript-idh-download-checkbox-',
        CONTAINER_ID_PREFIX = 'userscript-idh-container-',
        body = document.body,
        downloads = [],
        extensions = ['.jpg', '.png', '.gif'],
        images = document.getElementsByTagName('img'),
        REGEX_EXTRACT_EXTENSION = /.*(?=\.)/g,
        REGEX_EXTRACT_NUMBER = /.*\w(-)/g;
    
    var downloadButton = document.createElement('input');
    downloadButton.id = 'userscript-idh-download-button';
    downloadButton.type = 'button';
    downloadButton.textContent = 'Download images';
    downloadButton.style.cssText = `
     position: fixed;
     top: 5px;
     right: 5px;
     width: 50px;
     height: 20px;
    `;
    downloadButton.addEventListener('click', processDownloads);
    body.insertBefore(downloadButton, body.firstChild);

    addDownloadButtons();
	
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
		`;
		
		checkbox.id = `${CHECKBOX_ID_PREFIX}${i}`;
		checkbox.type = 'checkbox';
        checkbox.style.cssText = `
         position: absolute;
         top: 2px;
         right: 2px;
         width: 10px;
         height: 10px;
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
