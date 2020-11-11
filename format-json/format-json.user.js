// ==UserScript==
// @name         Format JSON
// @namespace     http://github.com/bakuzan/user-scripts
// @version      0.2.0
// @description  Format api response JSON in browser
// @author       Bakuzan
// @match        *://*/*.json
// @match        https://api.*
// @match        https://*/api/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const targetZone = document.querySelector('pre') ?? document.body;

  try {
    const json = JSON.parse(targetZone.textContent);
    const formatted = JSON.stringify(json, null, 2);

    document.body.innerHTML =
      '<code><pre style="white-space:pre-wrap;word-break:break-word" id="bkzJSON"></pre></code>';

    document.getElementById('bkzJSON').textContent = formatted;
  } catch (e) {
    console.log('BKZ: Failed to format JSON.');
  }
})();
