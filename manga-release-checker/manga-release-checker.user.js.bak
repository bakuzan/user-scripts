// ==UserScript==
// @name         Manga Release Checker.
// @namespace    https://github.com/bakuzan/user-scripts/tree/master/manga-release-checker
// @version      0.2.0
// @description  Pull out manga latest releases that are in my mal reading list. [supported sites: mangafox]
// @author       Bakuzan
// @match		 http://mangafox.me/releases/*
// @incude       http://mangafox.me/releases/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
	
    var readingList = [],
		REGEX = '\/\W+\/g',
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
		url: "https://raw.githubusercontent.com/bakuzan/user-scripts/master/manga-release-checker/manga-spellings.json",
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
        url: "http://myanimelist.net/malappinfo.php?u=bakuzan&status=all&type=manga",
        onload: function(response) {
            var xml = response.responseXML,
				nodes = xml.evaluate("//myanimelist/manga[my_status=1]/series_title/text()", xml, null, XPathResult.ANY_TYPE, null),
				result = nodes.iterateNext();
            while (result) {
                readingList.push(cleanText(result.nodeValue));
                result = nodes.iterateNext();
            }

            for (var i = 0; i < releases.length; i++) {
                var newChapter = releases[i],
					text = newChapter.getElementsByTagName('a')[0].textContent;
                if(readingList.indexOf(processText(text)) > -1) {
                    newChapter.className += ' userscript-mrc-highlight';
                    newChapterContainer.appendChild(newChapter);
                }
            }
            content.insertBefore(newChapterContainer, releaseList);
        }
    });
})();