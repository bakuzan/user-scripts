// ==UserScript==
// @name         Reddit Tracker
// @namespace    https://www.reddit.com
// @version      0.2
// @description  Keep track of time wasted on reddit
// @author       bakuzan
// @match        https://www.reddit.com/*
// @require      https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const ONE_SECOND = 1000;
    const ONE_MINUTE = ONE_SECOND * 60;
    const STORAGE_DATA = "redditTimed";
    const TODAY = new Date().toISOString().split("T")[0];

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

    const body = document.body;
    const container = buildElement("div", { id: "reddit-tracker-container", style: containerStyle });
    const timeDisplay = buildElement("div", { id: "reddit-tracker-time-display" });
    body.appendChild(container);
    container.appendChild(timeDisplay);

    const getRedditData = () => {
        const rawData = localStorage.getItem(STORAGE_DATA);
        return rawData ? JSON.parse(rawData) : {};
    };
    const getTodaysData = () => getRedditData()[TODAY] || { subs: [], time: 0 };
    const persistTodaysData = data => {
        const todayData = getRedditData();
        const updatedData = JSON.stringify(
          Object.assign({}, todayData, { [TODAY]: data })
        );
        localStorage.setItem(STORAGE_DATA, updatedData);
    };
    const padNumber = n => `${n}`.padStart(2, "0");

    function updateView(data) {
        const totalTime = data.time;
        const minutes = Math.floor(totalTime / ONE_MINUTE);
        const seconds = (totalTime - (minutes * ONE_MINUTE)) / ONE_SECOND;
        timeDisplay.textContent = `${padNumber(minutes)}:${padNumber(seconds)}`;
    }

    function updateTimeForToday() {
        const redditData = getRedditData();
        const todaysData = getTodaysData();
        const updatedTime = todaysData.time + ONE_SECOND;
        const updatedToday = Object.assign({}, todaysData, { time: updatedTime });
        updateView(updatedToday);
        persistTodaysData(updatedToday);
    }

    let interval;
    clearInterval(interval);
    interval = setInterval(updateTimeForToday, ONE_SECOND);

})();
