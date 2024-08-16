// ==UserScript==
// @name         Youtube subscription fader
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.2.4
// @description  Fade out watched videos in subscriptions
// @author       Bakuzan
// @noframes
// @match        https://*.youtube.com/*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/includes/monitorUrlChanges.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const listItemSelector = 'ytd-rich-grid-media';
    const progressSelector = '.ytd-thumbnail-overlay-resume-playback-renderer';

    const createItemGetter = (element) => (selector) =>
    element ? Array.from(element.querySelectorAll(selector)) : [];

    const matchNodesOfInterest = (x) =>
    x.tagName == 'YTD-THUMBNAIL-OVERLAY-NOW-PLAYING-RENDERER';

    function debug(...other) {
        console.log(`[Youtube Subscription Fader] :: `, ...other);
    }

    function runScript() {
        let timer = 0;
        const container = document.documentElement;
        const getSubscriptions = createItemGetter(container);

        function fadeSubscriptions() {
            let items = getSubscriptions(listItemSelector);
            debug(`Fading Subscriptions? :: `, items);
            for (const item of items) {
                const prog = item.querySelector(progressSelector);
                const width =
                      prog && prog.style && prog.style.width
                ? Number(prog.style.width.slice(0, -1))
                : 0;
                debug('Fading? :: ', item, prog, width);
                // Fade out the item if have watched more than X% of it.
                const opacity = width > 90 ? 0.10 : (100 - width) / 100;
                item.style = `opacity: ${opacity};`;
            }
        }

        const obs = new MutationObserver(([entry]) => {
            const hasAdded = Array.from(entry.addedNodes).some(matchNodesOfInterest);
            const hasRemoved = Array.from(entry.removedNodes).some(
                matchNodesOfInterest
            );

            if (hasAdded || hasRemoved) {
                clearTimeout(timer);
                timer = window.setTimeout(fadeSubscriptions, 500);
            }
        });

        obs.observe(document.documentElement, {
            attributes: false,
            childList: true,
            subtree: true
        });

        return () =>  obs.disconnect();
    }

    // Start script
    const urlMatch = /https:\/\/.*youtube.com\/feed\/subscriptions.*/;

    if (document && document.readyState !== 'loading') {
        monitorUrlChanges(urlMatch, runScript);
    } else {
        window.addEventListener('DOMContentLoaded', () =>
                                monitorUrlChanges(urlMatch, runScript)
                               );
    }
})();
