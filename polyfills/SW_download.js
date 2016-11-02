/*  SW_download
 *  
 *  @description  GM_download replacement with built in zipping.
 *  @author       Bakuzan
 *  @version      1.12
 */

// must include "@grant GM_xmlhttpRequest" at userscript metadata block
// must include "@require FileSaver" at userscript metadata block
// must include "@require jszip" at userscript metadata block

if (typeof GM_download !== 'function') {
    if (typeof GM_xmlhttpRequest !== 'function') {
        throw new Error('GM_xmlhttpRequest is undefined. Please set @grant GM_xmlhttpRequest at metadata block.');
    }
	
	function downloadAndFinish(requestData, downloadContent, downloadName) {
		saveAs(downloadContent, downloadName);
		if (typeof requestData.onafterload === 'function') requestData.onafterload(); // call onload function
	}
	
	function downloadZipFile(zip, requestData) {
		zip.generateAsync({type:"blob"}).then(function(content) {
			downloadAndFinish(requestData, content, 'idh-multiple-file-download.zip');
		});
	}
	
	function getZippedFilePromise(value, zip, fileName) {
		JSZipUtils.getBinaryContent(value.value, function (err, data){
			return new Promise(function(resolve, reject) {
				if(err) {
					reject(err);
				}
				else {
					zip.file(fileName, data, {binary:true});
					resolve(data);
				}
			});
        });
	}
	
	function getDataForZipping(result, zip, name) {
		var arraybuffer = result.response;
		console.log(`${name}`, zip, result);
		return getZippedFilePromise(arraybuffer, zip, name);
	}
	/*
	function getDataToAddToZip(zip, name) {
		console.log(`${name}`, zip);
		return function (result) {
			var arraybuffer = result.response;
			console.log(`${name}`, zip, arraybuffer);
			zip.file(name, arraybuffer, { binary: true });
		}
	}
	*/
	
	function initiateDownload(requesetData) {
		return function(result) {
			var blob = new Blob([result.response], {type: 'application/octet-stream'});
			downloadAndFinish(requesetData, blob, requesetData.name);
		};
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
				deffereds = [];
			for(let i = 0, length = urls.length; i < length; i++) {
				let download = urls[i];
				if (download.url === null) continue;
			
				data.url = download.url;
				data.name = download.name;
				data.onload = function(result) {
					return getDataForZipping(result, zip, download.name);
				};
				console.log(i, download, data);
				deffereds.push(GM_xmlhttpRequest(data));
			}
			Promise.all(deffereds).then(function(values) {
				data.onafterload = options.onload; // onload function support
				console.log(zip);
				downloadZipFile(zip, data);
			});
		} else {
			if (urls instanceof Object === false) return;
            if (urls.url === null) return;
			
			data.name = urls.name;
			data.url = urls.url;
			data.onload = initiateDownload(data);
			data.onafterload = options.onload; // onload function support
			
			return GM_xmlhttpRequest(data);
		}
    }
}
