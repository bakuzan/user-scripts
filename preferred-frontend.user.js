// ==UserScript==
// @name         Preferred Frontend
// @namespace    https://github.com/bakuzan/user-scripts
// @version      0.1.0
// @description  Script to redirect to alternate frontend sites
// @author       Bakuzan
// @match        https://twitter.com/*
// @match        https://www.reddit.com/*
// @match        https://old.reddit.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) {
    return;
  }

  function debug(...other) {
    console.log(`[Preferred Frontend] :: `, ...other);
  }

  const RedirectMap = new Map([
    ['twitter.com', 'https://nitter.unixfox.eu'],
    ['www.reddit.com', 'https://teddit.net'],
    ['old.reddit.com', 'https://teddit.net']
  ]);

  const { host, pathname } = window.location;
  const redirectSite = RedirectMap.get(host);

  if (redirectSite) {
    const targetUrl = redirectSite + pathname;
    debug(`Redirecting...`, window.location.href, ` -> `, targetUrl);
    window.location.href = targetUrl;
  } else {
    debug(`Script matched, but host not found in map!`, host, pathname);
  }
})();
