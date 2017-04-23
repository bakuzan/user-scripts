// ==UserScript==
// @name         Encode hash in url
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.0.2
// @description  Fix non-encoded urls when opened from windows explorer.
// @author       Bakuzan
// @include      file:///*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
	
	var fileUrl = window.location.href;
	if (fileUrl.indexOf('#') > -1) {
		window.location.href = fileUrl.replace(/#(?!t=)/g, '%23');
	}
	
})();
