// ==UserScript==
// @name        Add Controls to HTML5 videos
// @namespace   video-controls-html5
// @version     2
// @description Adds controls to HTML5 videos
// @grant none
// @exclude        *//*.youtube.com/*
// ==/UserScript==

document.addEventListener("DOMContentLoaded", function() {
  for (var e of document.getElementsByTagName('video')) e.setAttribute('controls', true);
});
