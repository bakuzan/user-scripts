// ==UserScript==
// @name         Anime release highlighter.
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Highlight anime latest releases that are in my mal reading list. [supported sites: animefreak]
// @author       Bakuzan
// @match		 http://www.animefreak.tv/tracker
// @incude       http://www.animefreak.tv/tracker
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
	  	    
	var RELEASE_COUNT = 0,
		REGEX = '\/\W+\/g',
		HIGHLIGHT_CLASS = ' userscript-arh-highlight',
		CONTAINER_ID = 'userscript-arh-container';
        
    var content = document.getElementById('primary'),
		releaseList = content.getElementsByTagName('tbody')[0],
        releases = releaseList.children,
		len = releases.length;
        
    var newReleaseContainer = document.createElement('DIV');
    newReleaseContainer.id = CONTAINER_ID;
	
	function cleanText(text) {
		return text.toLowerCase().replace(REGEX, '');
	}
	
	function processText(text) {
		var itemLowerCase = text.toLowerCase().replace(REGEX, ''),
            index = itemLowerCase.indexOf('episode');
        if (index > -1) {
            itemLowerCase = itemLowerCase.substring(0, index - 1); //-1 to account for space.
        }
		return itemLowerCase;
	}
    
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://myanimelist.net/malappinfo.php?u=bakuzan&status=all&type=anime",
        onload: function(response) {
			//Pre-added series that aren't on MAL, or are spelled differently.
            var watchList = [
				cleanText('Saiki Kusuo no Psi-nan'),cleanText('Naruto Shippuuden'),cleanText('Macross Delta')
			],
			xml = response.responseXML,
			nodes = xml.evaluate("//myanimelist/anime[my_status=1]/series_title/text()", xml, null, XPathResult.ANY_TYPE, null),
			result = nodes.iterateNext();
            while (result) {
                watchList.push(cleanText(result.nodeValue));
                result = nodes.iterateNext();
            }

            for (var i = 0; i < len; i++) {
                var release = releases[i],
					text = release.getElementsByTagName('a')[0].textContent;
                if(watchList.indexOf(processText(text)) > -1) {
                    release.className += HIGHLIGHT_CLASS;
                    RELEASE_COUNT++;
                }
            }
            newReleaseContainer.textContent = `Found ${RELEASE_COUNT} anime from your current watch list.`;
            content.insertBefore(newReleaseContainer, content.childNodes[0]);
        }
    });
})();