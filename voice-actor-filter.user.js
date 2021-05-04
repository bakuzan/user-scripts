// ==UserScript==
// @name         MAL Voice role filter
// @namespace    https://github.com/bakuzan/user-scripts
// @version      0.2.0
// @description  Filter MAL voice actor roles by your MAL list anime.
// @author       Bakuzan
// @match        http://myanimelist.net/people/*
// @include		   https://myanimelist.net/people/*
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ROLE_FILTER_CONTROL = ' role-filter-control';
  const ADD_ID = 'hide-add-checkbox';
  const EDIT_ID = 'hide-edit-checkbox';
  const ADD_TEXT = 'button_add';
  const EDIT_TEXT = 'button_edit';
  const HIDE_ADD_TEXT = 'Hide unlisted series.';
  const HIDE_EDIT_TEXT = 'Hide listed series.';
  const IGNORE_TABLES_FROM_HERE_CLASS = 'bgColor1';

  function getRolesTables() {
    const tables = Array.from(
      document.querySelectorAll('table td:nth-child(2) table')
    );

    const cutoff = tables.findIndex(
      (x) => x.className == IGNORE_TABLES_FROM_HERE_CLASS
    );

    return tables.slice(0, cutoff);
  }

  function getRolesLists() {
    return getRolesTables().map((x) =>
      Array.from(x.querySelector('tbody').getElementsByTagName('tr'))
    );
  }

  function checkRoles(roleListIndex, text, hideIt) {
    const roles = getRolesLists()[roleListIndex];

    for (let i = 0, len = roles.length; i < len; i++) {
      const role = roles[i];
      const anchors = role.childNodes[3].getElementsByTagName('a');
      const type = anchors[1].className;

      if (type.indexOf(text) > -1) {
        role.style.display = hideIt ? 'none' : '';
      }
    }
  }

  function changeHandler(event) {
    const target = event.target;
    const [targetId, num] = target.id.split('_');

    if (targetId === ADD_ID) return checkRoles(num, ADD_TEXT, target.checked);
    if (targetId === EDIT_ID) return checkRoles(num, EDIT_TEXT, target.checked);
  }

  function createControls(num) {
    const checkboxContainer = buildElement('div', {
      id: `voice-actor-filter-controls_${num}`,
      className: ' borderClass'
    });

    const hideAddCheckBox = buildElement('input', {
      id: `${ADD_ID}_${num}`,
      type: 'checkbox',
      className: ROLE_FILTER_CONTROL
    });

    const hideEditCheckBox = buildElement('input', {
      id: `${EDIT_ID}_${num}`,
      type: 'checkbox',
      className: ROLE_FILTER_CONTROL
    });

    const hideAddText = buildElement('span', { textContent: HIDE_ADD_TEXT });
    const hideEditText = buildElement('span', { textContent: HIDE_EDIT_TEXT });

    hideAddCheckBox.addEventListener('change', changeHandler);
    hideEditCheckBox.addEventListener('change', changeHandler);

    checkboxContainer.appendChild(hideAddCheckBox);
    checkboxContainer.appendChild(hideAddText);
    checkboxContainer.appendChild(hideEditCheckBox);
    checkboxContainer.appendChild(hideEditText);

    return checkboxContainer;
  }

  function setup() {
    const pageContainer = document.querySelector('table td:nth-child(2)');
    const tables = getRolesTables();

    tables.forEach((x, i) => {
      const controls = createControls(i);
      pageContainer.insertBefore(controls, x);
    });
  }

  setup();
})();
