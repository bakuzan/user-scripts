// ==UserScript==
// @name         Image download helper
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.6.4
// @description  Take selected image url's and download them to your PC.
// @author       Bakuzan
// @noframes
// @include      http*
// @exclude      http://localhost*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/includes/FileSaver.min.js
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/includes/jszip.min.js
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/polyfills/SW_download.js
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/findWithAttr.js
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/pad.js
// @require	 https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/cssSelectorPath.js
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/wrapElementWithNewParent.js
// @resource     stylesheet https://raw.githubusercontent.com/bakuzan/user-scripts/master/image-download-helper/image-download-helper.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant	 GM_openInTab
// ==/UserScript==

(function() {
    'use strict';
    
    class ImageDownloadHelper {
		constructor() {
			this.initalisedCount = 0;
		}
        reinitalise() {
			console.info('%c reinitalising image download helper...', 'color: #0000ff; font-weight: bold');
			setTimeout(() => {
				return this.init();
			}, 500);
        }
        init() {
            if (window.top !== window.self) return;
			
			this.initalisedCount++;
			if (this.initalisedCount > 1) console.info(`%c initalised image download helper : ${this.initalisedCount}`, 'color: #ff00ff; font-weight: bold');

            var cssTxt  = GM_getResourceText ("stylesheet");
            GM_addStyle (cssTxt);

            var body = document.body,
                CHECKBOX_ID_PREFIX = 'userscript-idh-download-checkbox-',
                CHECK_SIMILAR_ID = 'userscript-idh-check-similar-button',
                CONTAINER_CLASS = 'userscript-idh-wrapper',
                downloads = [],
                extensions = ['.jpg', '.png', '.gif'],
                hasDownloadButtons = false,
                images = document.getElementsByTagName('img'),
                REGEX_EXTRACT_EXTENSION = /.*(?=\.)/g,
                REGEX_EXTRACT_NUMBER = /.*\w(-)/g,
                REGEX_REMOVE_SIZE_SUFFIX = /.\d+x\d+(?=\.\w+$)/g;

            var activateButton = buildElement('input', { id: 'userscript-idh-add-checkboxes-button', type: 'button', title: 'Toggle checkboxes', value: 'I/O' }),
                alertMessage = buildElement('div', { id: 'userscript-idh-reverse-search-alert', textContent: 'Click an image to send to reverse search.' }),
                checkAllContainer = buildElement('div', { id: 'userscript-idh-check-all' }),
                checkAllButton = buildElement('input', { id: 'userscript-idh-check-all-button', type: 'button', value: 'Toggle Check ALL images' }),
                checkSimilarButton = buildElement('input', { id: CHECK_SIMILAR_ID, type: 'button', value: 'Check similar images?' }),
                controls = buildElement('div', { id: 'userscript-idh-controls' }),
                downloadButton = buildElement('input', { id: 'userscript-idh-download-button', type: 'button', title: 'Download selected images', value: 'DL' }),
                expandButton = buildElement('div', { id: 'userscript-idh-expand-button', title: 'Toggle image controls', textContent: '>>' }),
                searchButton = buildElement('input', { id: 'userscript-idh-reverse-search-button', type: 'button', title: 'Reverse image search', value: 'Search' });

            controls.style.left = '-182px';
            function toggleControls() {
                var showControls = controls.style.left === '-182px';
                controls.style.left = showControls ? '0' : '-182px';
            }

            controls.addEventListener('DOMNodeRemoved', () => { this.reinitalise(); });
            downloadButton.addEventListener('click', processDownloads);
            activateButton.addEventListener('click', addDownloadButtons);
            searchButton.addEventListener('click', activateReverseImageSearch);
            expandButton.addEventListener('click', toggleControls);

            controls.appendChild(downloadButton);
            controls.appendChild(activateButton);
            controls.appendChild(searchButton);
            controls.appendChild(expandButton);
            body.insertBefore(controls, body.firstChild);

            function createDownloadWrapper(i) {
                var container = buildElement('span', { className: `${CONTAINER_CLASS}` }),
                    checkbox = buildElement('input', { id: `${CHECKBOX_ID_PREFIX}${i}`, type: 'checkbox' });

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
                        wrapElementWithNewParent(downloadWrapper, image);
                    }
                    hasDownloadButtons = true;
                    displayCheckAllOption(true);
                } else {
                    for(var j = 0, count = images.length; j < count; j++) {
                        var imageForToggle = images[j],
                            originalParent = imageForToggle.parentNode.parentNode,
                            checkbox = imageForToggle.previousSibling;
                        toggleParentHref(originalParent);
                        var makeCheckboxesVisible = checkbox.style.display === 'none';
                        checkbox.style.display = makeCheckboxesVisible ? 'block' : 'none';
                        checkbox.checked = false;
                        downloads = [];
                        displayCheckAllOption(makeCheckboxesVisible);
                    }
                }
            }

            function stripImageSizes(downloads) {
                return new Promise((resolve, reject) => {
                    for(var i = 0, length = downloads.length; i < length; i++) {
                        var download = downloads[i];
                        download.url = download.url.replace(REGEX_REMOVE_SIZE_SUFFIX, '');
                    }
                    resolve(downloads);
                });
            }

            function downloadImage(downloads) {
                stripImageSizes(downloads).then(result => {
                    if(result.length === 1) {
                        result = result[0];
                    }

                    SW_download(result, {
                        header: {
                            "Referer": window.host
                        },
                        onload: function(){
                            addDownloadButtons();
                        },
                        onerror: function(){
                            alert(`Attempted download(s) failed!`);
                        }
                    });
                });
            }

            function checkAllSimilarImages(event) {
                var checkType = event.target.id, exampleSrc, exampleImg, checkAllSelector, checkAllImages = images;
                if(checkType === CHECK_SIMILAR_ID) {
                    exampleSrc = downloads[0];
                    exampleImg = document.querySelector(`img[src='${exampleSrc.url}']`);
                    checkAllSelector = buildSelectorPath(exampleImg);
                    checkAllImages = document.querySelectorAll(checkAllSelector);
                }
                for(var i = 0, len = checkAllImages.length; i < len; i++) {
                    var image = checkAllImages[i],
                        checkbox = image.previousSibling;
                    if(exampleImg !== undefined && image.src === exampleImg.src) continue;
                    checkbox.setAttribute('checked', true);
                    checkbox.click();
                }
            }

            function checkAllSetup() {    
                checkAllButton.addEventListener('click', checkAllSimilarImages);
                checkSimilarButton.addEventListener('click', checkAllSimilarImages);

                checkAllContainer.appendChild(checkAllButton);
                checkAllContainer.appendChild(checkSimilarButton);
                body.appendChild(checkAllContainer);
            }

            function displayCheckAllOption(showCheckAllContainer) {   
                if(!checkAllContainer.parentNode) checkAllSetup();
                var displayCheckSimilar = downloads.length > 0;
                checkSimilarButton.style.display = displayCheckSimilar ? 'block' : 'none';
                if(showCheckAllContainer !== undefined) checkAllContainer.style.display = showCheckAllContainer ? 'block' : 'none';
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
                if(event.detail) displayCheckAllOption();
            }

            function processDownloads() {
                if(downloads.length) downloadImage(downloads);
                else alert('Nothing selected for download.');
            }

            function activateReverseImageSearch(event) {
                body.insertBefore(alertMessage, body.firstChild);
                body.addEventListener('click', searchImage);
            }

            function addParamsToForm(aForm, aKey, aValue) {
                var hiddenField = buildElement('input', { type: 'hidden', name: aKey, value: aValue });
                aForm.appendChild(hiddenField);
            }

            function searchImage(event) {
                var target = event.target;
                if(target.nodeName === 'IMG') {
                    var imageURL = event.target.getAttribute("src");
                    if (imageURL.indexOf("data:") === 0) {
                        var base64Offset = imageURL.indexOf(",");
                        if (base64Offset != -1) {
                            var inlineImage = imageURL.substring(base64Offset + 1)
                            .replace(/\+/g, "-")
                            .replace(/\//g, "_")
                            .replace(/\./g, "=");

                            var form = buildElement('form', {
                                method: 'POST',
                                action: '//www.google.com/searchbyimage/upload',
                                enctype: 'multipart/form-data',
                                target: '_blank'
                            });
                            addParamsToForm(form, "image_content", inlineImage);
                            addParamsToForm(form, "filename", "");
                            addParamsToForm(form, "image_url", "");
                            body.appendChild(form);
                            form.submit();
                        }
                    } else {
                        GM_openInTab(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageURL)}`);
                    }
                    body.removeChild(alertMessage);
                    body.removeEventListener('click', searchImage);
                }
            }
        }
    }
    
    const idh = new ImageDownloadHelper();
    idh.init();
})();
