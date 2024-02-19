// ==UserScript==
// @name         MAL Override
// @namespace   https://github.com/bakuzan/user-scripts
// @author      Bakuzan
// @version      2024-02-19
// @description  Prevent MAL disabling the Submit button
// @match        https://myanimelist.net/ownlist/*/*/edit
// @icon         https://www.google.com/s2/favicons?sz=64&domain=myanimelist.net
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const button = document.querySelector("input[value='Submit']");
  const noop = () => null;
  let obs = null;

  if (button) {
    window.alert = noop; // They pop an alert to annoy me.

    obs = new MutationObserver((mutations) => {
      if (mutations.length) {
        const target = mutations[0]?.target;
        if (target && target.getAttribute('disabled') !== null) {
          // Stop listening so we don't get an infinite loop
          obs.disconnect();
          target.removeAttribute('disabled');

          // I already clicked, so do it for me this time.
          requestAnimationFrame(() => button.click());
        }
      }
    });

    obs.observe(button, {
      attributeFilter: ['disabled']
    });
  }
})();
