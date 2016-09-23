// ==UserScript==
// @name         Manga Release Checker.
// @namespace    sc4r4b@toshi
// @version      0.1.3
// @description  Pull out manga latest releases that are in my mal reading list. [supported sites: mangafox]
// @author       Bakuzan
// @match		 http://mangafox.me/releases/*
// @incude       http://mangafox.me/releases/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
	
    var REGEX = '\/\W+\/g',
		content = document.getElementById('content'),
		nav = document.getElementById('nav'),
		releaseList = document.getElementById('updates'),
        releases = releaseList.children,
		len = releases.length,
        newChapterContainer = document.createElement('DIV');
    newChapterContainer.id = 'userscript-mrc-container';
	newChapterContainer.appendChild(nav);
	
	function cleanText(text) {
		return text.toLowerCase().replace(REGEX, '');
	}
	
	function processText(text) {
		var itemLowerCase = text.toLowerCase(),
            index = itemLowerCase.indexOf('(');
        if (index > -1) {
            itemLowerCase = itemLowerCase.substring(0, index - 1); //-1 to account for space.
        }
		return itemLowerCase.replace(REGEX, '');
	}
	
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://myanimelist.net/malappinfo.php?u=bakuzan&status=all&type=manga",
        onload: function(response) {
			//Pre-added series that aren't on MAL, or are spelled differently.
            var readingList = [],
            xml = response.responseXML,
            nodes = xml.evaluate("//myanimelist/manga[my_status=1]/series_title/text()", xml, null, XPathResult.ANY_TYPE, null),
			result = nodes.iterateNext();
            while (result) {
                readingList.push(cleanText(result.nodeValue));
                result = nodes.iterateNext();
            }
			
			GM_xmlhttpRequest({
				method: "GET",
				url: "https://raw.githubusercontent.com/bakuzan/user-scripts/master/manga-release-checker/manga-spellings.json",
				onload: function(response) {
					var data = eval(`(${response.responseText})`);
					console.log('data: ', data);
				}
			});

            for (var i = 0; i < releases.length; i++) {
                var newChapter = releases[i],
					text = newChapter.getElementsByTagName('a')[0].textContent;
					//console.log(text, newChapter.getElementsByTagName('a'));
                if(readingList.indexOf(processText(text)) > -1) {
                    newChapter.className += ' userscript-mrc-highlight';
                    newChapterContainer.appendChild(newChapter);
                }
            }
            content.insertBefore(newChapterContainer, releaseList);
        }
    });
})();