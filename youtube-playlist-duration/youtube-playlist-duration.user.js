// ==UserScript==
// @name         Youtube playlist duration
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.4.4
// @description  Add playlist duration to youtube
// @author       Bakuzan
// @noframes
// @match        https://*.youtube.com/*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/includes/monitorUrlChanges.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        window.trustedTypes.createPolicy('default', {
            createHTML: (string, sink) => string
        });
    }

    const DISPLAY_ID = 'ypd-duration';
    const TIME_BLOCK_CLASS = 'ytd-thumbnail-overlay-time-status-renderer';
    const guard = (num, label) => (num ? `${num} ${label}` : '');
    const matchNodesOfInterest = (x) =>
    (x.className &&
     typeof x.className === 'string' &&
     x.className.includes(TIME_BLOCK_CLASS)) ||
          (x.querySelector && x.querySelector(`.${TIME_BLOCK_CLASS}`));

    function debug(...other) {
        console.log(`[Youtube Playlist Duration] :: `, ...other);
    }

    function convertTimeStringToSeconds(str) {
        if (!str.includes(':')) {
            // Cases where the videos isn't available yet have the element with some text.
            // We'll ignore these
            return 0;
        }

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

        const targetOnPageSelector = '.metadata-action-bar.style-scope.ytd-playlist-header-renderer';
        const stats =
              document.querySelector(targetOnPageSelector);

        if (!stats) {
            debug(`${targetOnPageSelector} blocks not found`);
            return null;
        }

        duration = stats.insertBefore(document.createElement('div'));
        duration.id = DISPLAY_ID;
        duration.style.cssText = `display: initial; font-size: 2.25rem; font-family: 'Lucida Console', monospace; margin: 20px 0 10px;`;
        duration.className =
            'style-scope ytd-playlist-sidebar-primary-info-renderer yt-playlist-duration';

        return duration;
    }

    function displayCalculatedDuration(seconds) {
        const h = guard(Math.floor(seconds / 60 / 60), 'hours');
        seconds = seconds % (60 * 60);

        const m = guard(Math.floor(seconds / 60), 'minutes');
        const s = guard(seconds % 60, 'seconds');

        const display = getDisplay();
        if (!display) {
            debug(`Display not added.`);
            return;
        }

        const durationHtml = [h, m, s]
            .filter((x) => !!x)
            .join(' ')
            .trim();

        debug(`Duration: `, durationHtml);
        display.innerHTML = window.trustedTypes.defaultPolicy.createHTML(durationHtml);
    }

    async function runPlaylistDuration() {
        let timer = 0;

        const obs = new MutationObserver(([entry]) => {
            // debug(`Document Mutation `, { entry });
            const hasAdded = Array.from(entry.addedNodes).some(matchNodesOfInterest);
            const hasRemoved = Array.from(entry.removedNodes).some(
                matchNodesOfInterest
            );

            if (hasAdded || hasRemoved) {
                debug(`Time Block Change`);
                clearTimeout(timer);
                timer = window.setTimeout(() => {
                    const value = calculatePlaylistDuration();
                    displayCalculatedDuration(value);
                }, 500);
            }
        });

        obs.observe(document.documentElement, {
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
