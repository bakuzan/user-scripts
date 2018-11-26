// ==UserScript==
// @name         Reddit Tracker
// @namespace    https://www.reddit.com
// @version      1.4.1
// @description  Prevent and keep track of time wasted on reddit
// @author       bakuzan
// @match        https://www.reddit.com/*
// @exclude      https://www.reddit.com/r/Dashboard*
// @exclude		 https://www.reddit.com/me/m/*
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (window.top !== window.self) {
        return;
    }

	let interval;
    const generateUniqueId = () =>
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
    const SCRIPT_ID = generateUniqueId();
    const ONE_SECOND = 1000;
    const ONE_MINUTE = ONE_SECOND * 60;
    const STORAGE_DATA = "redditTimed";
    const TODAY = new Date().toISOString().split("T")[0];
	const allowedSubreddits = [
	  'anime',
	  'dankruto',
	  'kingdom',
	  'manga',
	  'memepiece',
	  'onepiece',
	  'outoftheloop',
	  'patientgamers',
	  'prequelmemes',
	  'shitpostcrusaders',
	  'stardustcrusaders',
	  'totalwar'
	];

    const containerStyle = `
    position: fixed;
    bottom: 0;
    left: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgb(255, 255, 255);
    width: 75px;
    height: 20px;
    border: 1px solid magenta;
    `;
    const timesUpStyle = `
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000;
    color: #fff;
    font-size: 18px;
    `;

    const body = document.body;
    const container = buildElement("div", { id: "reddit-tracker-container", style: containerStyle });
    const timeDisplay = buildElement("div", { id: "reddit-tracker-time-display" });
    body.appendChild(container);
    container.appendChild(timeDisplay);

    const getRedditData = () => {
        const rawData = localStorage.getItem(STORAGE_DATA);
        return rawData ? JSON.parse(rawData) : {};
    };
    const getTodaysData = () => getRedditData()[TODAY] || { subs: [], time: 0, lastUpdate: {} };
    const persistTodaysData = data => {
        const todayData = getRedditData();
        const updatedData = JSON.stringify(
          Object.assign({}, todayData, { [TODAY]: data })
        );
        localStorage.setItem(STORAGE_DATA, updatedData);
    };
    const padNumber = n => `${n}`.padStart(2, "0");

    function activateRedditBlock() {
        const node = document.body;
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }

        const timesUpDisplay = buildElement("div", { id: "reddit-tracker-timeup-display", style: timesUpStyle })
        timesUpDisplay.textContent = "Redditing limit reached!\n(30 minutes today)";
        node.appendChild(timesUpDisplay);
		
		clearInterval(interval);
    }

    function updateView(data) {
        const totalTime = data.time;
        const minutes = Math.floor(totalTime / ONE_MINUTE);
        const seconds = (totalTime - (minutes * ONE_MINUTE)) / ONE_SECOND;
        timeDisplay.textContent = `${padNumber(minutes)}:${padNumber(seconds)}`;
    }

    function updateTimeForToday() {
        const redditData = getRedditData();
        const todaysData = getTodaysData();
        const url = window.location.href;
        const currentSub = url.includes('/r/')
          ? window.location.href.split('/r/')[1].split('/')[0]
          : url.includes('/user/')
            ? 'user page'
            : 'home';
		const isNotAnException = !allowedSubreddits.includes(currentSub.toLowerCase());
		
		if (todaysData.time / ONE_MINUTE > 30 && isNotAnException) {
			activateRedditBlock();
		}

        if (todaysData.lastUpdate && todaysData.lastUpdate.id !== SCRIPT_ID) {
            const lastTime = todaysData.lastUpdate.at;
            const now = new Date().getTime();
            if (now - lastTime < ONE_SECOND * 3) {
                return;
            }
        }

        const uniqueSubs = [...todaysData.subs, currentSub].filter(
            (x, i, arr) => arr.indexOf(x) === i
        );
        const updatedTime = todaysData.time + ONE_SECOND;
        const updatedToday = Object.assign({}, todaysData, {
            time: updatedTime,
            subs: uniqueSubs,
            lastUpdate: {
                id: SCRIPT_ID,
                at: new Date().getTime()
            }
        });
        updateView(updatedToday);
        persistTodaysData(updatedToday);
    }

    clearInterval(interval);
    interval = setInterval(updateTimeForToday, ONE_SECOND);

})();