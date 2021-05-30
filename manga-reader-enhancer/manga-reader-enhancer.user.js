// ==UserScript==
// @name         Manga reader enhancer
// @namespace    https://github.com/bakuzan/user-scripts/manga-reader-enhancer
// @version      0.8.0
// @description  Enhance certain manga reader sites
// @author       bakuzan
// @match        *://mangahasu.se/*/*.html*
// @match        *://manganelo.com/chapter/*/*
// @match        *://readcomiconline.*/Comic/*/*
// @match        *://mangaplus.shueisha.co.jp/viewer/*
// @require      https://raw.githubusercontent.com/bakuzan/user-scripts/master/includes/waitForElement.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) {
    return;
  }

  const GO_TO_WIDGET_ID = 'mreGoToWidget';
  const GO_TO_FEEDBACK_ID = 'mreFeedback';
  const MRE_COUNTER_CLASS = 'mre-counter';
  const MRE_TOTAL_PAGES_ID = 'mre-total-pages';

  function log(...messages) {
    console.log(
      '%c [manga-reader-enhancer]: ',
      'color: purple; font-size: 16px;',
      ...messages
    );
  }

  function createCounterId(num) {
    return `mre_${num}_counter`;
  }

  function createCounter(num) {
    const counter = document.createElement('div');
    counter.className = MRE_COUNTER_CLASS;
    counter.id = createCounterId(num);
    counter.textContent = num;
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

  function removeExistingCounters() {
    return new Promise((resolve) => {
      const total = document.getElementById(MRE_TOTAL_PAGES_ID);
      if (total) {
        total.parentNode.removeChild(total);
      }

      const counters = document.querySelectorAll(`.${MRE_COUNTER_CLASS}`);

      for (const elem of counters) {
        elem.parentNode.removeChild(elem);
      }

      resolve(true);
    });
  }

  async function addPageCounters(imagesSelector, styleParentFn = () => null) {
    await removeExistingCounters();

    const images = Array.from(document.querySelectorAll(imagesSelector));
    const total = images.length;

    // Insert counters
    images.forEach((image, i) => {
      image.insertAdjacentElement('afterend', createCounter(i + 1));
      styleParentFn(image.parentNode);
    });

    // Append page total count
    const pageTotal = document.createElement('div');
    pageTotal.id = MRE_TOTAL_PAGES_ID;
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

  function scrollIntoView(element) {
    if (element.scrollIntoView) {
      element.scrollIntoView(true);
    } else {
      const top = element.offsetTop;
      window.scrollTo({ top });
    }
  }

  function handleUserInput(getCounterId, missingCounterFunction) {
    let inputContainer = document.getElementById(GO_TO_WIDGET_ID);
    if (inputContainer) {
      document.body.removeChild(inputContainer);
      return;
    }

    inputContainer = document.createElement('div');
    inputContainer.id = GO_TO_WIDGET_ID;
    inputContainer.style.cssText = `
        background-color: #000;
        color: #fff;
        position: fixed;
        top: 50%;
        left: 50%;
        min-width: 150px;
        padding: 10px;
        transform: translateX(-50%) translateY(-50%);
        box-shadow: 0px 0px 5px 1px #fff;
        z-index: 200;
    `;

    const form = document.createElement('form');
    form.autocomplete = 'off';
    form.innerHTML = `
        <label style="display: flex; flex-direction: column;">
            Go to page
            <input type="number" id="mreInput" min="0" style="color: #000;" />
        </label>
    `;

    function onSubmit(event) {
      event.preventDefault();

      const value = Number(document.getElementById('mreInput').value);
      const pageNumber = Math.max(0, value - 1);
      const counterId = getCounterId(pageNumber);
      const counter = document.getElementById(counterId);

      if (counter) {
        scrollIntoView(counter);
      } else if (!counter && pageNumber === 0) {
        window.scrollTo(0, 0);
      } else if (!counter && missingCounterFunction) {
        missingCounterFunction(pageNumber);
      } else if (!counter) {
        const message = document.createElement('div');
        message.id = GO_TO_FEEDBACK_ID;
        message.textContent = `${value} is not valid.`;
        inputContainer.childNodes.forEach((x) =>
          x.id === GO_TO_FEEDBACK_ID ? inputContainer.removeChild(x) : null
        );
        inputContainer.appendChild(message);
        return;
      }

      form.removeEventListener('submit', onSubmit);
      document.body.removeChild(inputContainer);
    }

    form.addEventListener('submit', onSubmit);

    inputContainer.appendChild(form);
    document.body.appendChild(inputContainer);
    requestAnimationFrame(() => document.getElementById('mreInput').focus());
  }

  function addKeyboardShortcutListeners(
    pageButtonsSelector,
    [PREV_BUTTON, NEXT_BUTTON],
    counterIdFunction = createCounterId,
    missingCounterFunction = null
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
        case 'g':
          handleUserInput(counterIdFunction, missingCounterFunction);
          break;
        default:
          return;
      }
    });
  }

  async function customMangaPlus() {
    const container = await waitForElement(
      'div[class^="Viewer-module_footer_"]',
      '#app'
    );

    container.style.cssText = 'bottom: 0px !important;';
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
    case 'readcomiconline.to':
      addKeyboardShortcutListeners(
        '.ml-chap-nav > a',
        ['Prev Chapter', 'Next Chapter'],
        (num) => `ml-pageid-${num + 1}`,
        (num) => {
          window.location.hash = num + 1;
          window.location.reload();
          window.scrollTo(0, 0);
        }
      );
      break;
    case 'mangaplus.shueisha.co.jp':
      customMangaPlus();
      break;
    default:
      return;
  }
})();
