// ==UserScript==
// @name         Episode shortcuts
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.0.1
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
  const HOST_NAME = window.location.host.replace(/([w]{3}(\d*)([.]))|(([.])\w{2,}$)/g, '');
  const HOME_KEY_CODE = 192;		// '@
  const NEXT = 'next';
  const NEXT_KEY_CODE = 190;		// .>
  const PREV = 'previous';
  const PREV_KEY_CODE = 188, 		// ,<
  const REGEX_EPISODE_TRIM = /\/(?=[^\/]*$).*/;
  const REGEX_GET_EPISODE = /^.*\//;
 
	class EpisodeShortcut() {
		constructor() {
			this.processor = {
				masterani: {
					episodeList: (currentPage) => {
						const episodes = 'http://www.masterani.me/anime/info/';
						const slug = currentPage.replace(REGEX_EPISODE_TRIM, '').replace(/^.*(?:watch)/, '');
						return `${episodes}${slug}`;
					},
					next: (currentPage) => {
						const episode = Number(currentPage.replace(REGEX_GET_EPISODE, ''))++;
						return `${currentPage.replace(REGEX_EPISODE_TRIM, '')}${episode}`;
					},
					previous: (currentPage) => {
						const episode = Number(currentPage.replace(REGEX_GET_EPISODE, ''))--;
						return `${currentPage.replace(REGEX_EPISODE_TRIM, '')}${episode}`;
					}
				}
			};
			this.handler = this.processor[HOST_NAME];
		}
		init() {
			this.currentPage = window.location.href;
			document.body.addEventListener('keydown', this.shortcutHandler);
		}
		goToNextPrevEpisode(direction) => {
			window.location.href = this.handler[direction](this.currentPage);
		}
		goToSeriesEpisodeList() => {
			window.location.href = this.handler.episodeList(this.currentPage);
		}
		shortcutHandler(event) => {
			event.preventDefault();
			const keyCode = event.which;
			const ctrlKey = event.ctrlKey;
			const shiftKey = event.shiftKey;
			if (keyCode === NEXT_KEY_CODE) {
				goToNextPrevEpisode(NEXT);
			} else if (keyCode === PREV_KEY_CODE) {
				goToNextPrevEpisode(PREV);
			} else if (keyCode === HOME_KEY_CODE) {
				goToSeriesEpisodeList();
			}
		}
		
	}
  
	const userscript = new EpisodeShortcut();
  userscript.init();
	
})();
