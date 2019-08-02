// ==UserScript==
// @name         Mangahasu page counters
// @namespace    http://mangahasu.se/
// @version      0.1.0
// @description  Add page counters to mangahasu reader
// @author       bakuzan
// @match        ^http(s?):\/\/mangahasu.se\/.*\/.*chapter.*\.html$
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  if (window.top !== window.self) {
    return;
  }

  function createCounter(number) {
    const counter = document.createElement('div');
    counter.textContent = number;
    counter.style.cssText = `
        position: relative;
        width: 30px;
        background-color: #222;
        color: white;
        padding-left: 5px;
        padding-right: 5px;
        margin-left: auto;
        margin-right: auto;
        margin-top: -12px;
        border: 1px solid white;
        border-radius: 10px;
        text-align: center;
        z-index: 100;
    `;

    return counter;
  }

  const container = document.getElementById('loadchapter');

  const images = Array.from(container.querySelectorAll('.img > img'));
  const total = images.length;

  // Insert counters
  images.forEach((image, i) =>
    image.insertAdjacentElement('afterend', createCounter(i + 1))
  );

  // Append page total count
  const pageTotal = document.createElement('div');
  pageTotal.textContent = `${total} pages`;
  pageTotal.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    padding: 10px;
    background: #1f1f1f;
    color: #f1f1f1;
    box-shadow: -1px -1px 2px 0px #ddd;
    z-index: 100;
  `;

  document.body.appendChild(pageTotal);
})();
