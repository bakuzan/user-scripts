// ==UserScript==
// @name         Youtube playlist duration
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.3.1
// @description  Add playlist duration to youtube
// @author       Bakuzan
// @noframes
// @match        https://*.youtube.com/*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/includes/monitorUrlChanges.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const DISPLAY_ID = 'ypd-duration';
  const guard = (num, label) => (num ? `${num} ${label}` : '');

  function convertTimeStringToSeconds(str) {
    return str
      .split(':')
      .reverse()
      .reduce((p, c, idx) => {
        c = parseInt(c, 10);

        switch (idx) {
          case 0: // s
            return p + c;
          case 1: // m
            return p + c * 60;
          case 2: // h
            return p + c * 60 * 60;
          default:
            return 0;
        }
      }, 0);
  }

  function calculatePlaylistDuration() {
    const spans = Array.from(
      document.querySelectorAll(
        'ytd-playlist-video-renderer span.ytd-thumbnail-overlay-time-status-renderer'
      )
    );

    return spans.reduce(
      (p, ts) => p + convertTimeStringToSeconds(ts.textContent.trim()),
      0
    );
  }

  function getDisplay() {
    let duration = document.getElementById(DISPLAY_ID);
    if (duration) {
      return duration;
    }

    const stats = document.getElementById('stats');
    duration = stats.appendChild(document.createElement('yt-formatted-string'));
    duration.id = DISPLAY_ID;
    duration.className =
      'style-scope ytd-playlist-sidebar-primary-info-renderer';

    return duration;
  }

  function displayCalculatedDuration(seconds) {
    const h = guard(Math.floor(seconds / 60 / 60), 'hours');
    seconds = seconds % (60 * 60);

    const m = guard(Math.floor(seconds / 60), 'minutes');
    const s = guard(seconds % 60, 'seconds');

    const display = getDisplay();
    display.innerHTML = [h, m, s]
      .filter((x) => !!x)
      .join(' ')
      .trim();
  }

  function runPlaylistDuration() {
    let timer = 0;
    const list = document.querySelector(
      '#contents.style-scope.ytd-playlist-video-list-renderer'
    );

    const obs = new MutationObserver(([entry]) => {
      const hasAdded = entry.addedNodes.length;
      const hasRemoved = entry.removedNodes.length;

      if (hasAdded || hasRemoved) {
        clearTimeout(timer);
        timer = window.setTimeout(() => {
          const value = calculatePlaylistDuration();
          displayCalculatedDuration(value);
        }, 500);
      }
    });

    obs.observe(list, {
      attributes: false,
      childList: true,
      subtree: true
    });

    // Initial display if the mutation observer isn't triggered.
    requestAnimationFrame(() => {
      const value = calculatePlaylistDuration();
      displayCalculatedDuration(value);
    });

    return () => obs.disconnect();
  }

  // Start script
  const urlMatch = /https:\/\/.*youtube.com\/playlist.*/;

  if (document && document.readyState !== 'loading') {
    monitorUrlChanges(urlMatch, runPlaylistDuration);
  } else {
    window.addEventListener('DOMContentLoaded', () =>
      monitorUrlChanges(urlMatch, runPlaylistDuration)
    );
  }
})();
