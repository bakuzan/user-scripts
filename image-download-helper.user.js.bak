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
    
    var images = document.getElementsByTagName('img');
    addDownloadButtons();
    
    function createDownloadIcon(i) {
        var element = document.createElement('span');
        element.id = `userscript-idh-download-button-${i}`;
        element.style.cssText = `
         position: absolute;
         top: 2px;
         right: 2px;
         width: 5px;
         height: 5px;
         background: white;
         border: 1px solid #aaa;
         cursor: pointer;
        `;
        element.addEventListener('click', processDownload);
        return element;
    }
    
    function addDownloadButtons() {
        for(var i = 0, length = images; i < length; i++) {
            var image = images[i],
                downloadIcon = createDownloadIcon(i);
            image.insertBefore(downloadIcon, image.firstChild);
        }
        console.log(images);
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
        console.log('process dl: ', event);
    }
    
})();
