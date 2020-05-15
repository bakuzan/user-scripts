// ==UserScript==
// @name         Youtube subscription fader
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.2.0
// @description  Fade out watched videos in subscriptions
// @author       Bakuzan
// @noframes
// @match        https://*.youtube.com/*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/includes/monitorUrlChanges.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const listItemSelector = 'ytd-shelf-renderer.ytd-item-section-renderer';
  const gridItemSelector = 'ytd-grid-video-renderer.ytd-grid-renderer';
  const createItemGetter = (element) => (selector) =>
    element ? Array.from(element.querySelectorAll(selector)) : [];

  function runScript() {
    let timer = 0;
    const container = document.querySelector('ytd-section-list-renderer');
    const getSubscriptions = createItemGetter(container);

    function fadeSubscriptions() {
      let items = getSubscriptions(gridItemSelector);

      if (!items.length) {
        items = getSubscriptions(listItemSelector);
      }

      for (const item of items) {
        if (item.textContent.includes('WATCHED')) {
          item.style = `opacity: 0.25;`;
        } else {
          item.style = `opacity: 1;`;
        }
      }
    }

    const obs = new MutationObserver(([entry]) => {
      const hasAdded = entry.addedNodes.length;
      const hasRemoved = entry.removedNodes.length;

      if (hasAdded || hasRemoved) {
        clearTimeout(timer);
        timer = window.setTimeout(fadeSubscriptions, 500);
      }
    });

    obs.observe(container, { childList: true, subtree: true });
    requestAnimationFrame(fadeSubscriptions);

    return () => obs.disconnect();
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
