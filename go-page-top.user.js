// ==UserScript==
// @name        Go page top
// @namespace   https://github.com/bakuzan/user-scripts
// @authour      Bakuzan
// @description Link to scroll to the top of the page.
// @include     http*
// @exclude     https://www.reddit.com/*
// @run-at      document-start
// @version     1.0
// @grant       none
// ==/UserScript==

(function() {
  'use strict';
  
  var body = document.body,
      button = document.createElement('span');
  button.id = 'userscript-gpt-button';
  button.style.cssText = `display: none;
                          postion: absolute; 
                          right: 25px;
                          bottom: 25px;
                          content: '\25B2';
                         `;
  
  function buttonDisplayStatus(status) {
    button.style.display = status ? '' : 'none';
  }
  
  function scrollPageTop() {
    window.scrollTo(0,0);
  }
  
  function toggleScrollPageTopButton() {
    var distanceScrolledDown = body.scrollTop;
    console.log('distance: ', distanceScrolledDown);
    if (distanceScrolledDown > 100) buttonDisplayStatus(true);
    if (distanceScrolledDown < 100) buttonDisplayStatus(false);
  }
  
  button.addEventListener('click', scrollPageTop);
  window.addEventListener('scroll', toggleScrollPageTopButton);
  body.appendChild(button);
  
})();