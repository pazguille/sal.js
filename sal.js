/*
* Simple Ajax Librarysal v0.1
*/

// http://www.html5rocks.com/en/tutorials/file/xhr2/

/*
TODO: Add Events
readystatechange: The readyState attribute changes at some seemingly arbitrary times for historical reasons.
loadstart: When the request starts.
progress: While sending and loading data.
abort: When the request has been aborted. For instance, by invoking the abort() method.
error: When the request has failed.
load: When the request has successfully completed.
timeout: When the author specified timeout has passed before the request could complete.
loadend: When the request has completed (either in success or failure).


var progEv = !!(window.ProgressEvent);
var fdata = !!(window.FormData);
var wCreds = window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest;

*/

(function (window, undefined) {

  var sal = (function () {
	
	var Ajax = function (conf) {
		var that = this,
			conf = conf || {},
			methods = {
				"header": function (key, value) {
					conf.headers[key] = value;
	
					return methods;
				},
				"data": function (data) {
					conf.data = data;
		
					return methods;
				},
				"async": function (value) {
					conf.async = value;
					
					return methods;
				},
				"cache": function (value) {
					conf.cache = value;
					
					return methods;
				},
				"success": function (hanlder) {
					conf.success = hanlder;
		
					return methods;
				},
				"failure": function (handler) {
					conf.failure = hanlder;
		
					return methods;
				},
				"responseType": function (value) {
					conf.responseType = value;
	
					return methods;
				},
				"form": function (id, obj) {
					conf.data = new FormData(id);
	
					for (var key in obj) {
						conf.data.append(key, obj[key]);
					}
	
					return methods;
				},
	
				"send": function () {
					var xhr = that.xhr;

					if (conf.jsonp) {
						that.setJSONP(conf.url, conf.success);
						return that.xhr;
					}

					if (typeof xhr.onload === "object" && typeof xhr.onerror === "object") {
						xhr.onload = function () {
							if (conf.hasOwnProperty("success")) {
								var response = (conf.json) ? JSON.parse(xhr.response) : xhr.response;
					 			conf.success(response, xhr.status);
						 	}
						};
						
						xhr.onerror = function () {
							if (conf.hasOwnProperty("failure")) {
						 		conf.failure(xhr);
						 	}
						};

					// Fallback
					} else {
						xhr.onreadystatechange = function () {
							that.stateChange(conf);
						};
					}
					

					if (window.ProgressEvent) {
						xhr.onprogress = function (e) {};
					}


					xhr.open(conf.method, conf.url, conf.async);
					that.setHeaders(conf.headers);
					xhr.responseType = conf.responseType;
					xhr.send(conf.data);
					
					return xhr;
				}
			};

		// Configuration
		conf.headers = conf.headers || {};
		conf.headers["Accept"] = "text/javascript, application/json, text/html, application/xml, text/xml, */*";
		conf.headers["Cache-Control"] = "cache";
		conf.headers["Content-Type"] = "application/x-www-form-urlencoded";
		conf.responseType = ""; //"text", "arraybuffer", "blob", or "document"
		conf.cache = true;
		conf.async = true;

		// XMLHttpRequest obj
		this.xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

		//IE8
		//this.xhr.overrideMimeType('text/plain; charset=x-user-defined');

		return methods;
	};
	
	Ajax.prototype.setJSONP = function (url, handler) {
		var that = this;
		var callback = "_jsonp" + parseInt(new Date().getTime());

		window[callback] = function (data, status) {
			window[callback] = undefined;
			window[callback] = null;

			return handler(data, status);
		};

		var scriptTag = document.createElement("script");
			scriptTag.charset = 'utf-8';
			scriptTag.src = url.replace("salp", callback);

		
		document.body.appendChild(scriptTag);
		scriptTag.onload = function () {
			document.body.removeChild(scriptTag);
		};
		
	};

	Ajax.prototype.stateChange = function (conf) {
		var xhr = this.xhr;
		 if (xhr.readyState == 4 ) {
			var response = xhr.response|| xhr.responseText;

		 	if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && response)) {
				if (conf.hasOwnProperty("success")) {
					//IE7 JSON.parse
					response = (conf.json) ? JSON.parse(response) : response;
		 			conf.success(response, xhr.status);
			 	}
		 	} else {
			 	if (conf.hasOwnProperty("failure")) {
			 		conf.failure(xhr);
			 	}
			}

		 }
	};

	Ajax.prototype.setHeaders = function (headers) {
		for (var key in headers) {
			this.xhr.setRequestHeader(key, headers[key]);
		};
	};

	var core = {

		"get": function (url) {
			var cnx = new Ajax({
				"method": "get",
				"url": url
			});

			return cnx;
		},
		"post": function (url) {
			var cnx = new Ajax({
				"method": "post",
				"url": url
			});

			return cnx;
		},
		"json": function (url) {
			var cnx = new Ajax({
				"method": "get",
				"url": url,
				"headers": {
					"Content-Type": "application/json"
				},
				"json": true
			});

			return cnx;
		},
		"jsonp": function (url) {			
			var cnx = new Ajax({
				"method": "get",
				"url": url,
				"headers": {
					"Content-Type": "application/json"
				},
				"jsonp": true
			});

			return cnx;
		}
	};

    return core;

  })();

  window.sal = sal;

})(window);