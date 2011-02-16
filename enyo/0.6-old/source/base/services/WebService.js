/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A web service component initiates and processes an AJAX request.
This component is an abstraction of the XMLHttpRequest object.

To initialize a web service component:

	{name: "getWeather", kind: "WebService",
		url: "http://somewebsite.com/weather.json",
		onSuccess: "gotWeather",
		onFailure: "gotWeatherFailure"}

To initiate the AJAX request:

	this.$.getWeather.call({location: "Sunnyvale CA"});
	
Note: You can set any of the published properties via the setter function, 
e.g. setUrl(). For example, if you need to change the URL before initiating 
the AJAX request, you can do this:

	this.$.getWeather.setUrl("http://somewebsite.com/Sunnyvale+CA/weather.json");
	this.$.getWeather.call();

(Please see the <b>Published Properties</b> section for a full list of available options.)

To process the AJAX response:

	gotWeather: function(inSender, inResponse, inRequest) {
		this.results = inResponse;
	}
	
If the handleAs property is set to "json" (default), the content of the responseText 
property will automatically be converted into a JavaScript object.

To handle failure:

	gotWeatherFailure: function(inSender, inResponse, inRequest) {
		console.log("got failure from getWeather");
	}
	
A third parameter, <code>inRequest</code>, is always passed to the event handler 
functions. It contains a lot of details about the request, including a 
reference to the actual XHR object. For example, status code can be 
retrieved via <code>inRequest.xhr.status</code>.

You can obtain HTTP response headers from the XHR object using getResponseHeader. 
For example, to get Content-Type in the response headers:

	inRequest.xhr.getResponseHeader("Content-Type")

The default HTTP method is GET, to make a POST request, set method property to "POST".
Here is an example of making a POST request:

	{name: "login", kind: "WebService",
			url: "http://myserver.com/login",
			method: "POST",
			onSuccess: "loginSuccess",
			onFailure: "loginFailure"}
			
	this.$.login.call({username: "foo", password: "bar"});
*/
enyo.kind({
	name: "enyo.WebService",
	kind: enyo.Service,
	requestKind: "WebService.Request",
	published: {
		/**
		The url for the service.
		*/
		url: "",
		/**
		The HTTP method to use for the request. Defaults to GET.
		*/
		method: "GET", // {value: "GET", options: ["GET", "POST", "PUT", "DELETE"]},
		/**
		How the response will be handled. 
		Supported values are: <code>"json", "text", "xml"</code>.
		*/
		handleAs: "json", // {value: "json", options: ["text", "json", "xml"]},
		/**
		The Content-Type header for the request as a String.
		*/
		contentType: "application/x-www-form-urlencoded",
		/**
		If true, makes a synchronous (blocking) call, if supported.
		*/
		sync: false,
		/**
		Optional additional request headers in object format, or null.
		*/
		headers: null
	},
	//* @protected
	constructor: function() {
		this.inherited(arguments);
		this.headers = {};
	},
	makeRequestProps: function(inParams) {
		var props = {
			params: inParams,
			url: this.url,
			method: this.method,
			handleAs: this.handleAs,
			contentType: this.contentType,
			sync: this.sync,
			headers: this.headers
		};
		return enyo.mixin(props, this.inherited(arguments));
	}
});

//* @protected
enyo.kind({
	name: "enyo.WebService.Request",
	kind: enyo.Request,
	call: function() {
		var params = this.params || "";
		params = enyo.isString(params) ? params : enyo.objectToQuery(params);
		//
		var url = this.url;
		if (this.method == "GET" && params) {
			url += (url.indexOf('?') >= 0 ? '&' : '?') + params;
			params = null;
		}
		//
		var headers = {};
		headers["Content-Type"] = this.contentType;
		enyo.mixin(headers, this.headers);
		//
		enyo.xhr.request({
			url: url,
			method: this.method,
			callback: enyo.bind(this, "receive"),
			body: params,
			headers: headers,
			sync: window.PalmSystem ? false : this.sync
		});
	},
	receive: function(inText, inXhr) {
		this.xhr = inXhr;
		this.inherited(arguments, [inXhr]);
	},
	setResponse: function(inXhr) {
		var r;
		if (inXhr.status != 404) {
			switch (this.handleAs) {
				case "json":
					try {
						var resp = inXhr.responseText;
						r = resp && enyo.json.from(resp);
					} catch (e) {
						this.log("responseText is not in JSON format");
						this.log(e);
						this.log(resp);
						r = resp;
					}
					break;
				case "xml":
					r = inXhr.responseXML;
					break;
				default:
					r = inXhr.responseText;
					break;
			}
		}
		this.response = r;
	}
});