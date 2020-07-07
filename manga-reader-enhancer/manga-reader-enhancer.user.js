// ==UserScript==
// @name         Manga reader enhancer
// @namespace    https://github.com/bakuzan/user-scripts/manga-reader-enhancer
// @version      0.1.0
// @description  Enhance certain manga reader sites
// @author       bakuzan
// @match        *://mangahasu.se/*/*.html*
// @match        *://manganelo.com/chapter/*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) {
    return;
  }

  function log(...messages) {
    console.log(
      '%c [manga-reader-enhancer]: ',
      'color: purple; font-size: 16px;',
      ...messages
    );
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

  function addPageCounters(imagesSelector) {
    const images = Array.from(document.querySelectorAll(imagesSelector));
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
  }

  function addKeyboardShortcutListeners(
    pageButtonsSelector,
    [PREV_BUTTON, NEXT_BUTTON]
  ) {
    window.addEventListener('keydown', (event) => {
      const key = event.key;
      const btns = Array.from(document.querySelectorAll(pageButtonsSelector));

      switch (key) {
        case ',': {
          const prev = btns.find((x) => x.textContent === PREV_BUTTON);
          if (prev) {
            prev.click();
          } else {
            alert('No previous chapter.');
          }
          return;
        }
        case '.': {
          const next = btns.find((x) => x.textContent === NEXT_BUTTON);
          if (next) {
            next.click();
          } else {
            alert('No next chapter.');
          }
          return;
        }
        case 'KeyG':
          log('Jump to page not implemented yet.');
          break;
        default:
          return;
      }
    });
  }

  // Execute the stuff
  const [domain] = window.location.href.split('/').slice(2);

  switch (domain) {
    case 'mangahasu.se':
      addPageCounters('#loadchapter .img > img');
      addKeyboardShortcutListeners('.side-bar-read .change', ['Prev', 'Next']);
      break;
    case 'manganelo.com':
      addPageCounters('.container-chapter-reader > img');
      addKeyboardShortcutListeners('.navi-change-chapter-btn > a', [
        'PREV CHAPTER',
        'NEXT CHAPTER'
      ]);
      break;
    default:
      return;
  }
})();
