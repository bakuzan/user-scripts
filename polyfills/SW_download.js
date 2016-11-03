/*  SW_download
 *  
 *  @description  GM_download replacement with built in zipping.
 *  @author       Bakuzan
 *  @version      2.0
 */

// must include "@grant GM_xmlhttpRequest" at userscript metadata block
// must include "@require FileSaver" at userscript metadata block
// must include "@require jszip" at userscript metadata block

if (typeof GM_download !== 'function') {
    if (typeof GM_xmlhttpRequest !== 'function') {
        throw new Error('GM_xmlhttpRequest is undefined. Please set @grant GM_xmlhttpRequest at metadata block.');
    }
	
	function downloadAndFinish(options, downloadContent, downloadName) {
		saveAs(downloadContent, downloadName);
		if (typeof options.onload === 'function') options.onload(); // call onload function
	}
	
	function downloadZipFile(zip, options) {
		zip.generateAsync({type:"blob"}).then(function(content) {
			if(content.size === 22) alert('The zip is empty.');
			else downloadAndFinish(options, content, 'idh-multiple-file-download.zip');
		});
	}
	
	function getDataForZipping(result, zip, name) {
		var arraybuffer = result.response;
        zip.file(name, arraybuffer, { binary: true });
		return arraybuffer;
	}
	
    function SW_download (urls, options) {
        if (urls === null) return;
		
		var data = {
			method: 'GET',
			responseType: 'arraybuffer',
			onload: function() { }
		};
		
		for (var o in options) {
			if (o !== 'onload') data[o] = options[o];
		}
		
		if(Object.prototype.toString.call(urls) === '[object Array]' ) {
			var zip = new JSZip(),
				promises = [];
			for(let i = 0, length = urls.length; i < length; i++) {
				let download = urls[i];
				if (download.url === null) continue;
				var promise = new Promise(function(resolve, reject) { 
					GM_xmlhttpRequest({
						method: 'GET',
						responseType: 'arraybuffer',
						url: download.url,
						name: download.name,
						onload: function(result) {
							resolve(getDataForZipping(result, zip, download.name));
						}
					});
				});
				promises.push(promise);
			}
			//Pretty sweet way to force zipping process to wait until data has been retrieved.
			Promise.all(promises).then(function(values) {
				downloadZipFile(zip, options);
			});
		} else {
			if (urls instanceof Object === false) return;
            if (urls.url === null) return;
			
			data.name = urls.name;
			data.url = urls.url;
			data.onload = function (result) {
				var blob = new Blob([result.response], {type: 'application/octet-stream'});
				downloadAndFinish(data, blob, data.name);
			}
			data.onafterload = options.onload; // onload function support		
			return GM_xmlhttpRequest(data);
		}
    }
}
