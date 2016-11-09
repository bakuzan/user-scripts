// ==UserScript==
// @name         MAL Voice role filter
// @namespace    https://github.com/bakuzan/user-scripts
// @version      0.1.1
// @description  Filter MAL voice actor roles by your MAL list anime.
// @author       Bakuzan
// @match        http://myanimelist.net/people/*
// @include		 https://myanimelist.net/people/*
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var ROLE_FILTER_CONTROL = ' role-filter-control';
    var ADD_ID = 'hide-add-checkbox';
    var EDIT_ID = 'hide-edit-checkbox';
    var ADD_TEXT = 'button_add';
    var EDIT_TEXT = 'button_edit';
    var HIDE_ADD_TEXT = 'Hide unlisted anime.';
    var HIDE_EDIT_TEXT = 'Hide my anime.';
    
    //Create filter controls to add to page.
    var checkboxContainer = buildElement('div', { id: 'voice-actor-filter-controls', className: ' borderClass' });
    var hideAddCheckBox = buildElement('input', { id: ADD_ID, type: 'checkbox', className: ROLE_FILTER_CONTROL });
    var hideAddText = buildElement('span', { textContent: HIDE_ADD_TEXT });
    var hideEditCheckBox = buildElement('input', { id: EDIT_ID, type: 'checkbox', className: ROLE_FILTER_CONTROL });
    var hideEditText = buildElement('span', { textContent: HIDE_EDIT_TEXT });
    
    hideAddCheckBox.addEventListener('change', changeHandler);
    hideEditCheckBox.addEventListener('change', changeHandler);
    
    checkboxContainer.appendChild(hideAddCheckBox);
    checkboxContainer.appendChild(hideAddText);
    checkboxContainer.appendChild(hideEditCheckBox);
    checkboxContainer.appendChild(hideEditText);
    
    //Get roles list tr's
    var content = document.getElementById('content');
    var tbodys = content.getElementsByTagName('tbody');
    var rolesList = tbodys[1];
    var roles = rolesList.getElementsByTagName('tr');

    //Add filter controls to page.
    tbodys[0].childNodes[0].childNodes[2].insertBefore(checkboxContainer, rolesList.parentNode);

    //Check each role's class name.
    function checkRoles(text, hideIt) {
      for(var i = 0, len = roles.length; i < len; i++) {
        var role = roles[i];
        var anchors = role.childNodes[3].getElementsByTagName('a');
        var type = anchors[1].className;
        if(type.indexOf(text) > -1) {
            role.style.display = hideIt ? 'none' : '';
        }
      }
    }
    
    function changeHandler(event) {
        var target = event.target;
        if(target.id === ADD_ID) return checkRoles(ADD_TEXT, target.checked);
        if(target.id === EDIT_ID) return checkRoles(EDIT_TEXT, target.checked);
    }   
    
})();
