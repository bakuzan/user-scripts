// ==UserScript==
// @name         Anime release highlighter.
// @namespace    https://github.com/bakuzan/user-scripts/tree/master/anime-release-highlighter
// @version      0.3.0
// @description  Highlight anime latest releases that are in my mal reading list. [supported sites: animefreak, kissanime]
// @author       Bakuzan
// @include		 file:///C:/Users/Walshs/Documents/%23misc/ka-page.html
// @include      http://animefreak.tv/tracker
// @include      http://www.animefreak.tv/tracker
// @include      http://kissanime.to/
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
	  	    
	var CONTAINER_ID = 'userscript-arh-container',
        HIGHLIGHT_CLASS = ' userscript-arh-highlight',
        processors = {
            animefreak: animefreakProcessor,
            kissanime: kissanimeProcessor
        },
	REGEX_CLEANER = /\W|(?:sub)\)|(?:tv)\)/g,
        REGEX_EXTRACTER = /([w]{3}([.]))|(([.])\w{2})|([.com]$)/g,
        RELEASE_COUNT = 0,
        watchList = [];
    
    var newReleaseContainer = document.createElement('DIV');
    newReleaseContainer.id = CONTAINER_ID;
	
	function cleanText(text) {
		return text.toLowerCase().replace(REGEX_CLEANER, '');
	}
	
	function processText(text) {
		var itemLowerCase = text.toLowerCase().replace(REGEX_CLEANER, ''),
            index = itemLowerCase.indexOf('episode');
        if (index > -1) {
            itemLowerCase = itemLowerCase.substring(0, index);
        }
        console.log('processed text: ', itemLowerCase);
		return itemLowerCase;
	}
    
    function animefreakProcessor() {
        var content = document.getElementById('primary'),
            releaseList = content.getElementsByTagName('tbody')[0],
            releases = releaseList.children,
            len = releases.length;
        
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
    
    function kissanimeProcessor() {
        var KA_SCROLL_INNER = 'items',
			newLocation = document.getElementsByClassName('details')[0],
            content = document.getElementById('leftside'),
            container = content.getElementsByClassName(KA_SCROLL_INNER)[0],
            releases = container.getElementsByTagName('a'),
            len = releases.length
		newLocation.className = 'scrollable';
		newReleaseContainer.className += KA_SCROLL_INNER;
		
        while (len--) {
            var release = releases[len],
                text = release.textContent,
				img = release.firstChild;
            if(watchList.indexOf(processText(text)) > -1) {
                release.href += `/${release.title.replace(' ', '-')}?id=`;
                img.src = img.src || img.getAttribute('srctemp');
                newReleaseContainer.insertBefore(release, newReleaseContainer.firstChild);
            }
        }
        newLocation.insertBefore(newReleaseContainer, newLocation.firstChild);
    }
    
    function getProcessor() {
        var host = window.location.host;
        var domain = host.replace(REGEX_EXTRACTER, '') || 'kissanime';
        return domain;
    }
    
    function extractReleases(response) {
        var xml = response.responseXML,
            nodes = xml.evaluate("//myanimelist/anime[my_status=1]/series_title/text()", xml, null, XPathResult.ANY_TYPE, null),
            result = nodes.iterateNext();
        while (result) {
            watchList.push(cleanText(result.nodeValue));
            result = nodes.iterateNext();
        }
        processors[`${getProcessor()}`]();
    }
    
    function getExceptions(response) {
        var data = JSON.parse(response.responseText),
            series = data.names;
        for(var i = 0, len = series.length; i < len; i++) {
            watchList.push(cleanText(series[i]));
        }
        
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://myanimelist.net/malappinfo.php?u=bakuzan&status=all&type=anime",
            onload: extractReleases
        });
    }
    
    (function () {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://raw.githubusercontent.com/bakuzan/user-scripts/master/anime-release-highlighter/anime-spellings.json",
            onload: getExceptions
        });
    })();
    
})();
