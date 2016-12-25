// ==UserScript==
// @name         Episode shortcuts
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.0.8
// @description  Some conveinent keyboard shortcuts for anime site episode pages.
// @author       Bakuzan
// @include      http://www.masterani.me/anime/watch/*/*
// @include      http://kissanime.to/Anime/*/*?id=*
// @include      http://kissanime.ru/Anime/*/*?id=*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

	const body = document.body;
	const HOST_KISSANIME = 'kissanime';
	const HOST_NAME = window.location.host.replace(/([w]{3}(\d*)([.]))|(([.])\w{2,}$)/g, '');
	const HOME_KEY_CODE = 192;		// '@
	const LIST = 'episodeList';
	const NEXT = 'next';
	const NEXT_KEY_CODE = 190;		// .>
	const PREV = 'previous';
	const PREV_KEY_CODE = 188; 		// ,<
	const REGEX_EPISODE_TRIM = /\/(?=[^\/]*$).*/;
	const REGEX_GET_EPISODE = /^.*\//;
 
	class EpisodeShortcut {
		constructor(processor) {
			this.processor = processor;
			this.handler = this.processor[HOST_NAME];
			
			this.init();
		}
		init() {
			this.currentPage = window.location.href;
			if (HOST_NAME === HOST_KISSANIME) this.fixKissanimeEpisodeLink();
			
			body.addEventListener('keydown', (e) => { this.shortcutHandler(e); });
		}
		fixKissanimeEpisodeLink() {
			const idIndex = this.currentPage.indexOf('id=');
			const length = this.currentPage.length;
			if (idIndex + 3 === length) {
				const episode = body.querySelector('#selectEpisode > option:last-child');
				const value = episode.value;
				const baseUrl = currentPage.replace(REGEX_EPISODE_TRIM, '');
				this.updateWindowHref(`${baseUrl}/${value}`);
			}
		}
		goToHandler(namedHandle) {
			this.handler[namedHandle](this.currentPage, this.updateWindowHref);
		}
		updateWindowHref(url) {
			window.location.href = url;
		}
		shortcutHandler(event) {
			event.preventDefault();
			const keyCode = event.which;
			const ctrlKey = event.ctrlKey;
			const shiftKey = event.shiftKey;
			if (keyCode === NEXT_KEY_CODE) this.goToHandler(NEXT);
			if (keyCode === PREV_KEY_CODE) this.goToHandler(PREV);
			if (keyCode === HOME_KEY_CODE) this.goToHandler(LIST);
		}
		
	}

	const episodeShortcuts = new EpisodeShortcut({
		masterani: {
			episodeList: (currentPage, updateWindowHref) => {
				const episodes = 'http://www.masterani.me/anime/info';
				const slug = currentPage.replace(REGEX_EPISODE_TRIM, '').replace(/^.*(?:watch)/, '');
				updateWindowHref(`${episodes}${slug}`);
			},
			next: (currentPage, updateWindowHref) => {
				const episode = Number(currentPage.replace(REGEX_GET_EPISODE, '')) + 1;
				updateWindowHref(`${currentPage.replace(REGEX_EPISODE_TRIM, '')}/${episode}`);
			},
			previous: (currentPage, updateWindowHref) => {
				const episode = Number(currentPage.replace(REGEX_GET_EPISODE, '')) - 1;
				updateWindowHref(`${currentPage.replace(REGEX_EPISODE_TRIM, '')}/${episode}`);
			}
		},
		kissanime: {
			episodeList: (currentPage, updateWindowHref) => {
				updateWindowHref(currentPage.replace(REGEX_EPISODE_TRIM, ''));
			},
			next: () => {
				body.getElementById('btnNext').click();
			},
			previous: () => {
				body.getElementById('btnPrevious').click();
			}
		}
	});
	
})();