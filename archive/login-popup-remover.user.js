// ==UserScript==
// @name         Login Popup Remover
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Restore twitter
// @author       Bakuzan
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) {
    return;
  }

  function hideNag() {
    let st = document.createElement('STYLE');
    st.textContent =
      '#layers>.css-1dbjc4n.r-aqfbo4.r-1p0dtai.r-1d2f490.r-12vffkv.r-1xcajam.r-zchlnj>.css-1dbjc4n.r-12vffkv>.css-1dbjc4n.r-12vffkv>.css-1dbjc4n.r-l5o3uw, .css-1dbjc4n.r-1awozwy.r-14lw9ot.r-1dgieki.r-1efd50x.r-5kkj8d.r-18u37iz.r-16y2uox.r-1a1dyw.r-1swwhx3.r-1j3t67a.r-1qxgc49, .css-1dbjc4n.r-1awozwy.r-1kihuf0.r-18u37iz.r-1pi2tsx.r-1777fci.r-1pjcn9w.r-1xcajam.r-ipm5af.r-g6jmlv, .css-1dbjc4n.r-aqfbo4.r-1d2f490.r-12vffkv.r-1xcajam.r-zchlnj.r-ipm5af{display: none !important}';
    document.getElementsByTagName('HEAD')[0].appendChild(st);
  }

  const observer = new MutationObserver(() => {
    const html = document.querySelector('html');
    if (html && html.style.cssText) {
      html.style = '';
    }
  });

  observer.observe(document.documentElement, { attributes: true });
  hideNag();
})();
