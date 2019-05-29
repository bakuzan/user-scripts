// ==UserScript==
// @name         Video controls
// @namespace    http://github.com/bakuzan/user-scripts
// @version      0.3.2
// @description  Provide various controls for html5 video.
// @author       Bakuzan
// @noframes
// @include      http*
// @include      *.mp4
// @include      *.webm
// @include      file:///*
// @include	    *drive.google.com/videoplayback*
// @exclude      *drive.google.com/drive/*
// @exclude      *youtube*
// @require	     https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/wrapElementWithNewParent.js
// @require	     https://raw.githubusercontent.com/bakuzan/useful-code/master/scripts/buildElement.js
// @resource     stylesheet https://raw.githubusercontent.com/bakuzan/user-scripts/master/video-controls/video-controls.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
  'use strict';
  if (window.top !== window.self) return;

  const cssTxt = GM_getResourceText('stylesheet');
  GM_addStyle(cssTxt);

  let FIRST_CLICK_ON_KISSANIME = window.location.host === 'kissanime.ru';

  const body = document.body;
  const NEW_TAB_BUTTON_ID_PREFIX = 'userscript-ontv-button-';
  const NEW_TAB_BUTTON_CLASS = 'userscript-ontv-button';
  const NEW_TAB_CONTAINER_ID_PREFIX = 'userscript-ontv-container-';
  const NEW_TAB_CONTAINER_CLASS = 'userscript-ontv-container';
  const TRANSITION_CLASS = 'userscript-ontv-transition';
  const DISPLAY_BUTTON_CLASS = 'userscript-ontv-display-button';
  const DISPLAY_CLASS = 'userscript-ontv-display';
  const DISPLAY_SPEED_CLASS = 'userscript-ontv-display-speed';
  const onPlayButton = buildElement('input', {
    id: `${NEW_TAB_BUTTON_ID_PREFIX.slice(0, -1)}`,
    className: TRANSITION_CLASS,
    type: 'button',
    value: 'Open video in new tab?'
  });
  const PREVENT_SHOW_ON_PLAY_WINDOW = 10;

  const FULLSCREEN_KEY_CODE = 'f'; // f
  const INTRO_KEY_CODE = 'i'; // i
  const PLAY_KEY_CODE = ' '; // SAPCEBAR
  const SEEK_BACKWARD_KEY = '\\'; // \|
  const SEEK_FORWARD_KEY = '/'; // /?
  const SEEK_INTRO_SKIP = 90;
  const SEEK_LARGE_CHANGE = 30;
  const SEEK_NORMAL_CHANGE = 10;
  const SEEK_SMALL_CHANGE = 5;
  const PLAYBACK_FASTER_KEY = '='; // =
  const PLAYBACK_SLOWER_KEY = '-'; // -
  const PLAYBACK_RESET_KEY = '0'; // 0
  const PLAYBACK_FASTER = 0.25;
  const PLAYBACK_SLOWER = -0.25;
  const PLAYBACK_RESET = undefined;

  const videos = document.getElementsByTagName('video');
  if (!videos.length) {
    return;
  }

  function onPlayOpenInNewTab(event) {
    const target = event.target;
    window.open(target.getAttribute('video-link'), '_blank');
  }

  onPlayButton.addEventListener('click', onPlayOpenInNewTab);
  body.appendChild(onPlayButton);

  class VideoControlShortcuts {
    constructor(videoElement) {
      this.video = videoElement;

      body.addEventListener('keydown', (e) => {
        this.shortcutHandler(e);
      });

      this.createDisplays();
    }

    createDisplays() {
      this.help = buildElement('button', {
        className: DISPLAY_BUTTON_CLASS,
        type: 'button',
        textContent: '?'
      });
      this.helpDisplay = buildElement('pre', {
        className: DISPLAY_CLASS,
        textContent: `Controls
		--------
		Play: Spacebar
		Fullscreen: Ctrl + Shift + f
		Skip 1m30s: Ctrl + i
		Skip Forward (Small): / 
		Skip Forward (Normal): Ctrl + / 
		Skip Forward (Large): Ctrl + Shift + /
		Skip Backward (Small): \\
		Skip Backward (Normal): Ctrl + \\
		Skip Backward (Large): Ctrl + Shift + \\
		Playback Speed (Faster): Alt + =
		Playback Speed (Slower): Alt + -
		Playback Speed (Reset): Alt + 0
		`
      });

      this.helpDisplay.style = 'display: none;';
      this.help.addEventListener('click', () => {
        const s = this.helpDisplay.style;
        if (s.display === 'none') {
          s.display = 'block';
        } else {
          s.display = 'none';
        }
      });

      this.speedInfo = buildElement('div', {
        className: DISPLAY_SPEED_CLASS,
        textContent: 'x1'
      });

      body.appendChild(this.help);
      body.appendChild(this.helpDisplay);
      body.appendChild(this.speedInfo);

      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const rec = entry.target.getBoundingClientRect();

          this.speedInfo.style.cssText = `
          top: ${rec.top}px;
          left: ${rec.left + rec.width - 40}px;
          `;
        }
      });
      resizeObserver.observe(this.video);
    }

    toggleFullscreenMode() {
      if (this.video.requestFullscreen)
        return this.video.displayingFullscreen
          ? this.video.exitFullscreen()
          : this.video.requestFullscreen();
      if (this.video.mozRequestFullScreen)
        return this.video.mozDisplayingFullscreen
          ? this.video.mozExitFullscreen()
          : this.video.mozRequestFullScreen();
      if (this.video.webkitRequestFullscreen)
        return document.webkitIsFullScreen
          ? document.webkitCancelFullScreen()
          : this.video.webkitRequestFullscreen();
    }
    seekToPoint(moveInSeconds) {
      let seekToTime = this.video.currentTime + moveInSeconds;
      if (seekToTime < 0 || seekToTime > this.video.duration) {
        seekToTime = 0;
      }
      this.video.currentTime = seekToTime;
    }
    togglePlay() {
      return this.video.paused ? this.video.play() : this.video.pause();
    }
    adjustPlaybackSpeed(adjustment) {
      if (adjustment) {
        this.video.playbackRate = Math.max(
          0,
          this.video.playbackRate + adjustment
        );
      } else {
        this.video.playbackRate = 1;
      }

      this.speedInfo.textContent = `x${this.video.playbackRate}`;
    }
    shortcutHandler(event) {
      const key = event.key;
      const ctrlKey = event.ctrlKey;
      const shiftKey = event.shiftKey;
      const altKey = event.altKey;

      if (key === PLAY_KEY_CODE) {
        event.preventDefault();
        if (this.video !== document.activeElement) {
          this.video.focus();
        }
        if (FIRST_CLICK_ON_KISSANIME) {
          this.togglePlay();
          FIRST_CLICK_ON_KISSANIME = false;
        }
        this.togglePlay();
        this.video.blur();
      } else if (ctrlKey && shiftKey && key === FULLSCREEN_KEY_CODE) {
        this.toggleFullscreenMode();
      } else if (ctrlKey && key === INTRO_KEY_CODE) {
        this.seekToPoint(SEEK_INTRO_SKIP);
      } else if (key === SEEK_FORWARD_KEY) {
        if (ctrlKey && shiftKey) return this.seekToPoint(SEEK_LARGE_CHANGE);
        if (ctrlKey) return this.seekToPoint(SEEK_NORMAL_CHANGE);
        return this.seekToPoint(SEEK_SMALL_CHANGE);
      } else if (key === SEEK_BACKWARD_KEY) {
        if (ctrlKey && shiftKey) return this.seekToPoint(-SEEK_LARGE_CHANGE);
        if (ctrlKey) return this.seekToPoint(-SEEK_NORMAL_CHANGE);
        return this.seekToPoint(-SEEK_SMALL_CHANGE);
      } else if (altKey) {
        if (key === PLAYBACK_FASTER_KEY) {
          return this.adjustPlaybackSpeed(PLAYBACK_FASTER);
        } else if (key === PLAYBACK_SLOWER_KEY) {
          return this.adjustPlaybackSpeed(PLAYBACK_SLOWER);
        } else if (key === PLAYBACK_RESET_KEY) {
          return this.adjustPlaybackSpeed(PLAYBACK_RESET);
        }
      }
    }
  }

  class VideoControls {
    constructor(number, videoElement) {
      this.index = number;
      this.video = videoElement;

      this.init();
    }
    init() {
      this.createOpenInNewTabButton(this.index, this.video);
      this.video.addEventListener('play', (e) => {
        this.showOnPlayButton(e);
      });
      /*
       *	Wrapping a new parent causes layout issues.
       *	Need to find RELIABLE way to place button near associated video.
       */
      //wrapElementWithNewParent(openInNewTabButton, this.video);
    }
    createOpenInNewTabButton(index, video) {
      if (!video.paused) {
        video.pause();
      }

      const container = buildElement('div', {
        id: `${NEW_TAB_CONTAINER_ID_PREFIX}${index}`,
        className: NEW_TAB_CONTAINER_CLASS
      });
      const newTabButton = buildElement('input', {
        id: `${NEW_TAB_BUTTON_ID_PREFIX}${index}`,
        className: NEW_TAB_BUTTON_CLASS,
        type: 'button',
        value: 'View video'
      });

      newTabButton.addEventListener('click', this.openVideoInNewTab);

      container.appendChild(newTabButton);
      return container;
    }
    openVideoInNewTab(event) {
      window.open(
        this.video.getAttribute('src') ||
          this.video.firstChild.getAttribute('src'),
        '_blank'
      );
    }
    showOnPlayButton(event) {
      if (this.video.currentTime > PREVENT_SHOW_ON_PLAY_WINDOW) {
        return;
      }

      onPlayButton.style.cssText = 'opacity: 1; height: 50px';
      onPlayButton.setAttribute(
        'video-link',
        this.video.getAttribute('src') ||
          this.video.firstChild.getAttribute('src')
      );
      setTimeout(() => {
        onPlayButton.style.cssText = 'opacity: 0; height: 0';
      }, 5000);
    }
  }

  (function() {
    let controllers = [];
    let videoShortcuts;
    const length = videos.length;
    for (let i = 0; i < length; i++) {
      const video = videos[i];
      controllers.push(new VideoControls(i, video));
      videoShortcuts = new VideoControlShortcuts(video);
    }
  })();
})();
