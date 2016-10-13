// ==UserScript==
// @name         Anime release highlighter.
// @namespace    https://github.com/bakuzan/user-scripts/tree/master/anime-release-highlighter
// @version      0.3.2
// @description  Highlight anime latest releases that are in my mal reading list. [supported sites: animefreak, kissanime]
// @author       Bakuzan
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
        SCROLLER_CONTROLS_ID = 'userscript-arh-nav',
        SCROLLER_NEXT_ID = 'userscript-arh-next',
        SCROLLER_PREV_ID = 'userscript-arh-prev',
        SCROLLER_SHIFT = 675,
        watchList = [];
    
    var newReleaseContainer = document.createElement('DIV');
    newReleaseContainer.id = CONTAINER_ID;
    
    function digitsOnly(valueWithUnits) {
        return Number(valueWithUnits.replace('px', ''));
    }
    
    function scrollerMovement(event) {
        var id = event.target.id;
        if(id === SCROLLER_NEXT_ID) {
            newReleaseContainer.style.left = `${digitsOnly(newReleaseContainer.style.left) - SCROLLER_SHIFT}px`;
        } else if (id === SCROLLER_PREV_ID) {
            newReleaseContainer.style.left = (digitsOnly(newReleaseContainer.style.left) + SCROLLER_SHIFT > 0) ? 0 : `${digitsOnly(newReleaseContainer.style.left) + SCROLLER_SHIFT}px`;
        }
    }
	
    function cleanText(text) {
        return text.toLowerCase().replace(REGEX_CLEANER, '');
    }

	function processText(text) {
		var itemLowerCase = text.toLowerCase().replace(REGEX_CLEANER, ''),
	    index = itemLowerCase.indexOf('episode');
		if (index > -1) {
			itemLowerCase = itemLowerCase.substring(0, index);
		}
		return itemLowerCase;
	}
    
    function animefreakProcessor() {
        var content = document.getElementById('primary'),
            releaseList = content.getElementsByTagName('tbody')[0],
            releases = releaseList.children,
            len = releases.length;
        
        while (len--) {
            var release = releases[len],
                text = release.getElementsByTagName('a')[0].textContent;
            if(watchList.indexOf(processText(text)) > -1) {
                newReleaseContainer.insertBefore(release, newReleaseContainer.firstChild);
            }
        }
        content.insertBefore(newReleaseContainer, content.firstChild);
    }
	
	function kissanimeScrollerControls(scroller) {
		var recentNav = document.getElementById('recently-nav'),
            controls = recentNav.cloneNode(true),
            arrows = controls.getElementsByTagName('a'),
            prev = arrows[0], next = arrows[1];
 
        controls.id = SCROLLER_CONTROLS_ID;
        prev.id = SCROLLER_PREV_ID;
        next.id = SCROLLER_NEXT_ID;
        
        prev.addEventListener('click', scrollerMovement);
        next.addEventListener('click', scrollerMovement);
        
        scroller.parentNode.insertBefore(controls, scroller);
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
		kissanimeScrollerControls(newLocation);
    }
    
    function getProcessor() {
        var host = window.location.host;
        return host.replace(REGEX_EXTRACTER, '');
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
