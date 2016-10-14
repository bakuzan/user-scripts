// ==UserScript==
// @name        Go page top
// @namespace   https://github.com/bakuzan/user-scripts
// @authour     Bakuzan
// @description Link to scroll to the top of the page.
// @include     http*
// @version     0.1.0
// @grant       none
// ==/UserScript==

(function() {
  'use strict';
  
  var body = document.body,
      button = document.createElement('span');
  button.id = 'userscript-gpt-button';
  button.style.cssText = `
   display: none;
   position: fixed;
   right: 25px;
   bottom: 25px;
   width: 30px;
   height: 20px;
   padding: 5px;
   line-height: 10px;
   background-color: rgb(255, 255, 255);
   color: #aaa;
   border: 1px solid #aaa;
   cursor: pointer;
   font-size: 13px;
   font-weight: bold;
   font-family: Arial,Helvetica,Sans-Serif;
   text-align: center;
  `;
   button.textContent = '^\nTOP';
  
  function buttonDisplayStatus(status) {
    button.style.display = status ? 'block' : 'none';
  }
  
  function scrollPageTop() {
    window.scrollTo(0,0);
  }
  
  function toggleScrollPageTopButton() {
    var distanceScrolledDown = window.scrollY;
    console.log('distance: ', distanceScrolledDown);
    if (distanceScrolledDown > 100) buttonDisplayStatus(true);
    if (distanceScrolledDown < 100) buttonDisplayStatus(false);
  }
  
  button.addEventListener('click', scrollPageTop);
  window.addEventListener('scroll', toggleScrollPageTopButton);
  body.appendChild(button);
  
})();