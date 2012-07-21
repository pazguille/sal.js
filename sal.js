/*
http://en.wikipedia.org/wiki/Internet_media_type
 request.types = {
      html: 'text/html'
    , json: 'application/json'
    , urlencoded: 'application/x-www-form-urlencoded'
    , 'form': 'application/x-www-form-urlencoded'
    , 'form-data': 'application/x-www-form-urlencoded'
  };

Hacer que funcione CORS en IE 
http://www.leggetter.co.uk/2010/03/12/making-cross-domain-javascript-requests-using-xmlhttprequest-or-xdomainrequest.html
http://www.html5rocks.com/en/tutorials/cors/

*/



(function (exports) {
	'use strict';

	/**
	* Determine XHR.
	*/
	function getXHR() {
		var req;
		if (exports.XMLHttpRequest) {
			req = new XMLHttpRequest();
		}else if (exports.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
		}
		return req;
	};

	function Ajax(conf) {
			/**
			* Private Members
			*/
			var that = this,
				xhr;

			/**
			* Protected Members
			*/

			// podria hacer un extend entre this y conf, no?
			this.url = conf.url || './';
			this.success = conf.success;
			this.error = conf.error;
			this.data = this.toQueryString(conf.data),
			this.dataType = conf.dataType;

			if (this.dataType == 'jsonp') {
				return this.getJSONP();
			}

			this.headers = conf.headers;
			this.xhr = xhr = getXHR();

			/**
			* Public Members
			*/

			// Set XHR options
			xhr.responseType = conf.responseType || "";

			xhr.open(conf.method, this.url, conf.async, conf.user, conf.password);

			// Set Request Header
			this.setHeaders();

			// Add events
			xhr.onreadystatechange = function () {
				that.stateChange.call(that);
			}

			// Send
			xhr.send(this.data);

			return this;
		};

	Ajax.prototype.setHeaders = function () {
		var key,
			headers = this.headers,
			xhr = this.xhr,
			dataType = {
				'default': 'application/x-www-form-urlencoded; charset=UTF-8',
				'json': 'application/json, text/javascript',
				'jsonp': 'application/javascript'
			};

		// Default
		// http://en.wikipedia.org/wiki/Internet_media_type
		// CORS doesn't support setRequestHeader
		if (this.dataType === 'default') {
			xhr.setRequestHeader('Content-Type', dataType[this.dataType]);
			xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
			xhr.setRequestHeader('Accept','text/javascript, application/json, text/html, application/xml, text/xml, *\/*');
			xhr.setRequestHeader('Cache-Control','cache');
		}

		for (key in headers) {
			xhr.setRequestHeader(key, headers[key]);
		}

		return this;
	};

	Ajax.prototype.stateChange = function () {
		var xhr = this.xhr,
			status,
			response;
			
		if (xhr.readyState === xhr.DONE) {
			status = xhr.status;
			if (this.hasOwnProperty('success') && (status >= 200 && status < 300) || status === 304 || status === 0) {
				response = ((this.dataType === 'json') ? JSON.parse(xhr.response || xhr.responseText) : xhr.response);
	 			this.success(response, status, xhr);

		 	} else if (this.hasOwnProperty('error')) {
		 		this.error(status, xhr);
		 	}
		 }

	 	return this;
	};

	Ajax.prototype.toQueryString = function (data) {
		var key,
			queryString = [];

		for (key in data) {
			queryString.push((encodeURIComponent(key) + '=' + encodeURIComponent(data[key])));
		}

		return queryString.join('&');
	};
	
	Ajax.prototype.getJSONP = function () {
		var that = this,
			url = this.url,
			callback = "_jsonp" + parseInt(new Date().getTime());

		exports[callback] = function (data, status) {
			exports[callback] = undefined;

			return that.success(data, status);
		};

		if (url.match("\\?") === null) {
			url += "?callback=" + callback;
		} else {
			url += "&callback=" + callback;
		}

		if (this.data) {
			url += ("&" + this.data);
		}

		var scriptTag = document.createElement("script");
		scriptTag.charset = "utf-8";
		scriptTag.src = url;

		scriptTag.onload = function () {
			document.body.removeChild(scriptTag);
		};

		scriptTag.onerror = function () {
			if (that.hasOwnProperty("error")) {
		 		return that.error();
		 	}
		};

		document.body.appendChild(scriptTag);

		return this;
	};


	var sal = {
		'json': function (url, conf, fn) {
			sal.get(url, conf, fn, 'json');
		},
		'jsonp': function (url, conf, fn) {
			sal.get(url, conf, fn, 'jsonp');
		}
	};

	["get", "post"].forEach(function (method, i) {
		sal[method] = function (url, conf, fn, type) {
			if (typeof conf === 'function') {
				fn = conf;
				conf = {};
			}

			conf = conf || {};
			conf.url = url || conf.url;
			conf.success = fn || conf.success;
			conf.dataType = type || conf.dataType || 'default';

			// Default
			conf.method = method;

			return new Ajax(conf);
		};
	});

	exports.sal = sal;

}(this));


/*options = {
	method: String
	url: String
	async: Boolean
	user: String
	password: String
	headers: Object
		contentType
		cache
		(todos los headers que son configurables, esto que lo haga el user o le ofrezco algo?)
		http://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Requests
	timeout: Number
	withCredentials:Boolean
	responseType: "", "text", "arraybuffer", "blob", or "document"
	success: Function
	error: Function
	dataType: json, jsonp, default;
	data: Objcet
}*/