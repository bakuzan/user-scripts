// ==UserScript==
// @name        Go page top
// @namespace   https://github.com/bakuzan/user-scripts
// @authour     Bakuzan
// @description Link to scroll to the top of the page.
// @noframes
// @include     http*
// @version     0.1.5
// @require     https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @grant       none
// ==/UserScript==

(function() {
  'use strict';
  
  if (window.top !== window.self) return;
  
  var body = document.body,
      button = buildElement('span', { id: 'userscript-gpt-button', textContent: '^\nTOP' });
	button.style.cssText = `
		display: none;
		position: fixed;
		right: 25px;
		bottom: 25px;
		width: 30px;
		height: 20px;
		padding: 5px;
		line-height: 10px;
		background-color: #fff;
		color: #aaa;
		border: 1px solid #aaa;
		cursor: pointer;
		font-size: 13px;
		font-weight: bold;
		font-family: Arial,Helvetica,Sans-Serif;
		text-align: center;
		box-sizing: content-box;
	`;

	function buttonDisplayStatus(status) {
		button.style.display = status ? 'block' : 'none';
	}

	function scrollPageTop() {
		window.scrollTo(0,0);
	}

	function toggleScrollPageTopButton() {
		var distanceScrolledDown = window.scrollY;
		if (distanceScrolledDown > 100) buttonDisplayStatus(true);
		if (distanceScrolledDown < 100) buttonDisplayStatus(false);
	}

	button.addEventListener('click', scrollPageTop);
	window.addEventListener('scroll', toggleScrollPageTopButton);
	body.appendChild(button);
	
})();
