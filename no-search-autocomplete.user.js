// ==UserScript==
// @name         No Search Autocomplete
// @namespace    https://github.com/bakuzan/user-scripts
// @version      0.1
// @description  Turn off search autocompletes
// @author       Bakuzan
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function debug(...other) {
    console.log(`[No Search Autocomplete] :: `, ...other);
  }

  debug(`Looking for search inputs...`);
  const items = Array.from(document.querySelectorAll('input[type="search"]'));
  debug(`Found ${items.length} search inputs.`);
  items.forEach((element) => element.setAttribute('autocomplete', 'off'));
})();
