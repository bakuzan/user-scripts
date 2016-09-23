// ==UserScript==
// @name         MAL Voice role filter
// @namespace    https://github.com/bakuzan/user-scripts
// @version      0.2
// @description  Filter MAL voice actor roles by your MAL list anime.
// @author       Bakuzan
// @match        http://myanimelist.net/people/*
// @include		 https://myanimelist.net/people/*
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
    var checkboxContainer = document.createElement('div');
    checkboxContainer.id = 'voice-actor-filter-controls';
    checkboxContainer.className += ' borderClass';
    
    var hideAddCheckBox = document.createElement('input');
    hideAddCheckBox.id = ADD_ID;
    hideAddCheckBox.type = 'checkbox';
    hideAddCheckBox.className += ROLE_FILTER_CONTROL;
    hideAddCheckBox.addEventListener('change', changeHandler);
    
    var hideAddText = document.createElement('span');
    hideAddText.textContent = HIDE_ADD_TEXT;
    
    var hideEditCheckBox = document.createElement('input');
    hideEditCheckBox.id = EDIT_ID;
    hideEditCheckBox.type = 'checkbox';
    hideEditCheckBox.className += ROLE_FILTER_CONTROL;
    hideEditCheckBox.addEventListener('change', changeHandler);
    
    var hideEditText = document.createElement('span');
    hideEditText.textContent = HIDE_EDIT_TEXT;
    
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
        console.log(text, hideIt);
      for(var i = 0, len = roles.length; i < len; i++) {
        var role = roles[i];
        var anchors = role.childNodes[3].getElementsByTagName('a');
        var type = anchors[1].className;
          console.log(text, type);
        if(type.indexOf(text) > -1) {
            console.log(role, role.style);
            role.style.display = hideIt ? 'none' : '';
        }
      }
    }
    
    function changeHandler(event) {
        var target = event.target;
        if(target.id === ADD_ID) {
            checkRoles(ADD_TEXT, target.checked);
        } else if(target.id === EDIT_ID) {
            checkRoles(EDIT_TEXT, target.checked);
        }
    }   
    
})();