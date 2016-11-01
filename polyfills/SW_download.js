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
    
    function _arrayBufferToBase64(buffer) {
        var binary = '',
            bytes = new Uint8Array(buffer);
        for (var i = 0, length = bytes.byteLength; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
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
	
	function getDataToAddToZip(result) {
        //var blob = new Blob([result.response], {type: 'application/octet-stream'});
        //var bytes = new Uint8Array(result.response);
        var base64String = _arrayBufferToBase64(result.response);
		console.log('getDataToAddToZip: ', base64String);
		return base64String
	}
	
	function initiateDownload(requesetData) {
		return function(result) {
			var blob = new Blob([result.response], {type: 'application/octet-stream'});
			downloadAndFinish(requesetData, blob, requesetData.name);
		}
	}
	
    function SW_download (urls, options) {
        if (urls === null) return;
		
		var data = {
			method: 'GET',
			responseType: 'arraybuffer',
			onload: function() { }
		};
		
		for (var i in options) {
			if (i !== 'onload') data[i] = options[i];
		}
		
		if(Object.prototype.toString.call(urls) === '[object Array]' ) {
			var zip = new JSZip();
			for(var i = 0, length = urls.length; i < length; i++) {
				var download = urls[i];
				if (download.url === null) continue;
				
				var name = download.name;			
				data.url = download.url;
				data.name = name;
				data.onload = getDataToAddToZip;
                console.log(i, name, data);
				zip.file(name, GM_xmlhttpRequest(data));
			}
			data.onafterload = options.onload; // onload function support
			downloadZipFile(zip, data);
		} else {
			if (urls instanceof Object === false) return;
            if (urls.url == null) return;
			
			data.name = urls.name;
			data.url = urls.url;
			data.onload = initiateDownload(data);
			data.onafterload = options.onload; // onload function support
			
			return GM_xmlhttpRequest(data);
		}
    }
}