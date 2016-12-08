// ==UserScript==
// @name         Manga Release Checker.
// @namespace    https://github.com/bakuzan/user-scripts/tree/master/manga-release-checker
// @version      0.5.0
// @description  Pull out manga latest releases that are in my mal reading list. [supported sites: mangafox, eatmanga, mangatown]
// @author       Bakuzan
// @include		 http://mangafox.me/releases/*
// @include      http://eatmanga.com/latest/*
// @include		 http://www.mangatown.com/latest/text/*
// @resource     stylesheet https://raw.githubusercontent.com/bakuzan/user-scripts/master/manga-release-checker/manga-release-checker.css
// @require		 https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
	
	var cssTxt  = GM_getResourceText ("stylesheet");
	GM_addStyle (cssTxt);
	
    var CONTAINER_ID = 'userscript-mrc-container',
		HIGHLIGHT_CLASS = ' userscript-mrc-highlight',
        processors = {
            mangafox: mangafoxProcessor,
            eatmanga: eatmangaProcessor,
			mangatown: mangatownProcessor
        },
        readingList = [],
		REGEX = /\W|\d+ *$/g,
        REGEX_EXTRACTER = /([w]{3}([.]))|(([.])\w{2})|([.com]$)/g,
        TITLE_ID = 'userscript-mrc-title';
	
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
    
    function coreProcessor(options) {
        var content = document.querySelectorAll(options.containerSelector)[0],
            updates = document.querySelectorAll(options.listSelector)[0],
            releases = updates.children, //getElementsByTagName(options.itemTag),
            len = releases.length,
            title = buildElement('H2', { id: TITLE_ID, textContent: 'Latest from my manga' }),
            newChapterContainer = buildElement('DIV', { id: CONTAINER_ID });
        newChapterContainer.appendChild(title);
        
        while (len--) {
            var newChapter = releases[len],
				latest = newChapter.getElementsByTagName('a')[0],
				text;

			if(!latest) continue;

			text = latest.textContent;
            if(readingList.indexOf(processText(text)) > -1) {
				newChapter.className += HIGHLIGHT_CLASS;
                newChapterContainer.insertBefore(newChapter, title.nextSibling);
            }
        }
        content.insertBefore(newChapterContainer, content.children[0]);
    }
	
	function mangatownProcessor() {
        coreProcessor({
            containerSelector: '.article_content',
            listSelector: '.manga_text_content',
            itemTag: 'dl'
        });
	}
    
    function eatmangaProcessor() {
        coreProcessor({
            containerSelector: '#main_content',
            listSelector: '#updates',
            itemTag: 'tr'
        });
    }
    
    function mangafoxProcessor() {
        coreProcessor({
            containerSelector: '#content',
            listSelector: '#updates',
            itemTag: ''
        });
    }
    
    function getProcessor() {
        var host = window.location.host;
        return host.replace(REGEX_EXTRACTER, '');
    }

    function extractReleases(response) {
        var xml = response.responseXML,
            nodes = xml.evaluate("//myanimelist/manga[my_status=1]/series_title/text()", xml, null, XPathResult.ANY_TYPE, null),
            result = nodes.iterateNext();
        while (result) {
            readingList.push(cleanText(result.nodeValue));
            result = nodes.iterateNext();
        }
        processors[`${getProcessor()}`]();
    }
    
    function getExceptions(response) {
        var data = JSON.parse(response.responseText),
            series = data.names;
        for(var i = 0, len = series.length; i < len; i++) {
            readingList.push(cleanText(series[i]));
        }
        
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://myanimelist.net/malappinfo.php?u=bakuzan&status=all&type=manga",
            onload: extractReleases
        });
    }
    
    (function () {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://raw.githubusercontent.com/bakuzan/user-scripts/master/manga-release-checker/manga-spellings.json",
            onload: getExceptions
        });
    })();

})();
