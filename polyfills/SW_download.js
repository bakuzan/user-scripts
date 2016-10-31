/* 	SW_download
 *  
 *  @description  GM_download replacement with built in zipping.
 *  @author       Bakuzan
 *  @version      1.2
 */

// must include "@grant GM_xmlhttpRequest" at userscript metadata block
// must include "@require FileSaver" at userscript metadata block
// must include "@require jszip" at userscript metadata block

if (typeof GM_download !== 'function') {
    if (typeof GM_xmlhttpRequest !== 'function') {
        throw new Error('GM_xmlhttpRequest is undefined. Please set @grant GM_xmlhttpRequest at metadata block.');
    }
	
	function downloadZipFile(zip, requestData) {
		zip.generateAsync({type:"blob"}).then(function(content) {
			saveAs(content, 'idh-multiple-file-download.zip');
			if (typeof requestData.onafterload === 'function') requestData.onafterload(); // call onload function
		});
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
				
				data.url = download.url;
				data.name = download.name;
				data.onload = function addDownloadItemToZip(zip, name) {
					return function(res) {
						console.log(name, res, zip);
						zip.file(name, res.response);
					}
				}(zip, download.name)
				GM_xmlhttpRequest(data);
			}
			data.onafterload = options.onload; // onload function support
			downloadZipFile(zip, data);
		} else {
			if (urls instanceof Object === false) return;

            if (urls.url == null) return;
			
			data.name = urls.name;
			data.url = urls.url;
			data.onload = function initiateDownload(name) {
				return function(res) {
					var blob = new Blob([res.response], {type: 'application/octet-stream'});

					saveAs(blob, name);

					if (typeof data.onafterload === 'function') data.onafterload(); // call onload function
				}
			}(data.name)
			data.onafterload = options.onload; // onload function support
			
			return GM_xmlhttpRequest(data);
		}
    }
}
