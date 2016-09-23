// ==UserScript==
// @name         Anime release highlighter.
// @namespace    https://github.com/bakuzan/user-scripts/tree/master/anime-release-highlighter
// @version      0.2.0
// @description  Highlight anime latest releases that are in my mal reading list. [supported sites: animefreak]
// @author       Bakuzan
// @match		 http://www.animefreak.tv/tracker
// @incude       http://www.animefreak.tv/tracker
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
	  	    
	var watchList = [],
		RELEASE_COUNT = 0,
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
		url: "https://raw.githubusercontent.com/bakuzan/user-scripts/master/anime-release-highlighter/anime-spellings.json",
		onload: function(response) {
			var data = eval(`(${response.responseText})`),
				series = data.names;
			for(var i = 0, len = series.length; i < len; i++) {
				readingList.push(cleanText(series[i]));
			}
		}
	});
	
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://myanimelist.net/malappinfo.php?u=bakuzan&status=all&type=anime",
        onload: function(response) {
            var xml = response.responseXML,
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