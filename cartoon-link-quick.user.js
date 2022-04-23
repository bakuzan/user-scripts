// ==UserScript==
// @name         Cartoon Link Quick
// @namespace    https://github.com/bakuzan/user-scripts
// @version      1.0.0
// @description  Stop annoying redirects on cartoon site
// @author       Bakuzan
// @match        *://kimcartoon.li/Cartoon/*
// @match        *://kimcartoon.to/Cartoon/*
// @match        *://kimcartoon.me/Cartoon/*
// @match        *://kisscenter.net/*
// @icon         https://kimcartoon.li/Content/images/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.self !== window.top) {
    return;
  }

  // const URL_TARGET_TEMPLATE = `https://kisscenter.net/p/{title}?sig={sig}&s=beta&pfail=3`;
  function debug(...other) {
    console.log(` :: [Cartoon Link Quick] :: `, ...other);
  }

  function navigationHijack(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const target = e.path.find((x) => x.tagName === 'A');
    const url = new URL(target.href);

    // If there isn't some kind of search, the link probably isn't an episode.
    if (!url.search) {
      window.location.href = target.href;
      return;
    }

    debug(target, url);
    window.location.href = `${target.href}&s=beta&pfail=1`;

    // const pathParts = url.pathname.split('/').slice(2);
    // const title = pathParts.join('-');

    // const time = new Date().getTime().toString().slice(0, 10);
    // const raws = [...pathParts, time].join('|||');
    // const sig = window.btoa(raws);

    // const adjustedURL = URL_TARGET_TEMPLATE.replace('{title}', title).replace(
    //   '{sig}',
    //   sig
    // );
    // debug(target, url, pathParts, title, time, raws, sig, adjustedURL);
    // window.location.href = adjustedURL;
  }

  function applyClickHook(a) {
    a.addEventListener('click', navigationHijack);
  }

  function collectAnchorTags() {
    const elements = document.querySelectorAll(
      `a[href^="/Cartoon/"]:not(.bigChar)`
    );
    debug(elements);
    return elements;
  }

  function run() {
    window.setTimeout(() => {
      const anchors = collectAnchorTags();
      anchors.forEach(applyClickHook);
    }, 500);
  }

  // Run script
  if (
    document.readyState === 'interactive' ||
    document.readyState === 'complete'
  ) {
    run();
  } else {
    document.addEventListener('DOMContentLoaded', run);
  }
})();
