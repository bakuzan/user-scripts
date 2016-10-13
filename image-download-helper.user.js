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
    
    var REGEX_EXTRACT_NUMBER = /.*\w(-)/g
	    CONTAINER_ID_PREFIX = 'userscript-idh-container-',
		BUTTON_ID_PREFIX = 'userscript-idh-download-button-',
	    images = document.getElementsByTagName('img'),
		downloads = [];
    addDownloadButtons();
	
	function pad(number, width, padChar) {
	  padChar = padChar || '0';
	  number = number + '';
	  return number.length >= width ? number : new Array(width - number.length + 1).join(padChar) + number;
	}
    
    function createDownloadWrapper(i) {
        console.log('createDownloadWrapper');
		var container = document.createElement('span'),
		    checkbox = document.createElement('input');
        container.id = `${CONTAINER_ID_PREFIX}${i}`;
		container.style.cssText = `
		 position: relative;
		`;
		
		checkbox.id = `${BUTTON_ID_PREFIX}${i}`;
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
        checkbox.addEventListener('click', processDownload);
		container.appendChild(checkbox, container.firstChild);
		console.log('create container: ', container);
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
        console.log('wrap image: ', images);
    }
    
    function downloadImage(imageUrl, imageName) {
        GM_download({
            url: imageUrl,
            name: imageName,
            header: {
                "Referer": window.host
            },
            onload: function(response){
                alert(`Downloaded ${imageName} successfully!`);
            },
            onerror: function(){
                alert(`Download of ${imageName} failed!\n${imageUrl}`);
            }
        });
    }
    
    function processDownload(event) {
		var target = event.target,
		    id = target.id;
        console.log('process dl: ', id, target, target.nextSibling);
		if(target.checked) downloads.push({ url: target.nextSibling.src, name: pad(id.replace(REGEX_EXTRACT_NUMBER, ''), 3) });
		console.log('downloads: ', downloads);
    }
    
})();
