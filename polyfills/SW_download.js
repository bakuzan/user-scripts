/*  SW_download
 *
 *  @description  GM_download replacement with built in zipping.
 *  @author       Bakuzan
 *  @version      3.0.1
 */

// must include "@grant GM_xmlhttpRequest" at userscript metadata block
// must include "@require FileSaver" at userscript metadata block
// must include "@require jszip" at userscript metadata block
// must include "@require bakuzan/useful-code/master/scripts/buildElement.js" at userscript metadata block

if (typeof GM_download !== 'function') {
  if (typeof GM_xmlhttpRequest !== 'function') {
    throw new Error(
      'GM_xmlhttpRequest is undefined. Please set @grant GM_xmlhttpRequest at metadata block.'
    );
  }

  function downloadAndFinish(options, downloadContent, downloadName) {
    saveAs(downloadContent, downloadName);
    if (typeof options.onload === 'function') options.onload(); // call onload function
  }

  function downloadZipFile(zip, options, loadingDriver) {
    zip.generateAsync({ type: 'blob' }).then(function(content) {
      loadingDriver.remove();
      if (content.size === 22) {
        alert('The zip is empty.');
      } else {
        downloadAndFinish(options, content, 'idh-multiple-file-download.zip');
      }
    });
  }

  function getDataForZipping(result, zip, name) {
    var arraybuffer = result.response;
    zip.file(name, arraybuffer, { binary: true });
    return arraybuffer;
  }

  function startLoadingDisplay(total) {
    const display = buildElement('div', {
        id: 'sw-download-loading',
        textContent: 'Downloading...\r\n'
      }),
      progressLoad = buildElement('div', {
        id: 'sw-download-progress-load',
        textContent: `0/${total} Queued`
      }),
      progressDone = buildElement('div', {
        id: 'sw-download-progress-done',
        textContent: `0/${total} Loaded`
      });

    display.style.cssText = `
		position: fixed;
		top: 100px;
		left: 50%;
		transform: translateX(-50%);
		
		background-color: #eee;
		color: #000;
		padding: 25px;
		box-shadow: 1px 1px 5px 1px #000;
		z-index: 10000;

		font-size: 2em;
		font-weight: normal;
		font-family: "Lucida Console", "Courier New", monospace;
		text-align: center;
		white-space: pre-line;
	`;
    display.appendChild(progressLoad);
    display.appendChild(progressDone);
    document.body.appendChild(display);

    const driver = {
      __total: total,
      __loading: 0,
      __finished: 0,
      setLoading(num) {
        this.__loading = num;
        progressLoad.textContent = `${num}/${this.__total} Queued`;
      },
      setLoaded(num) {
        this.__finished = num;
        progressDone.textContent = `${num}/${this.__total} Loaded`;
      },
      zipping() {
        progressLoad.textContent = '';
        progressDone.textContent = '';
        display.textContent = 'Zipping...';
      },
      remove() {
        document.body.removeChild(display);
      }
    };

    return driver;
  }

  function SW_download(urls, options) {
    if (urls === null) return;

    var data = {
      method: 'GET',
      responseType: 'arraybuffer',
      onload: function() {}
    };

    for (var o in options) {
      if (o !== 'onload') data[o] = options[o];
    }

    if (Object.prototype.toString.call(urls) === '[object Array]') {
      const loadingDriver = startLoadingDisplay(urls.length);
      var zip = new JSZip(),
        promises = [];

      for (let i = 0, length = urls.length; i < length; i++) {
        let download = urls[i];
        if (download.url === null) {
          continue;
        }

        var promise = new Promise(function(resolve, reject) {
          GM_xmlhttpRequest({
            method: 'GET',
            responseType: 'arraybuffer',
            url: download.url,
            name: download.name,
            onload: function(result) {
              loadingDriver.setLoaded(i + 1);
              resolve(getDataForZipping(result, zip, download.name));
            }
          });
        });

        promises.push(promise);
        loadingDriver.setLoading(i + 1);
      }
      //Pretty sweet way to force zipping process to wait until data has been retrieved.
      Promise.all(promises).then(function(values) {
        loadingDriver.zipping();
        downloadZipFile(zip, options, loadingDriver);
      });
    } else {
      if (urls instanceof Object === false) return;
      if (urls.url === null) return;

      data.name = urls.name;
      data.url = urls.url;
      data.onload = function(result) {
        var blob = new Blob([result.response], {
          type: 'application/octet-stream'
        });
        downloadAndFinish(data, blob, data.name);
      };
      data.onafterload = options.onload; // onload function support
      return GM_xmlhttpRequest(data);
    }
  }
}
