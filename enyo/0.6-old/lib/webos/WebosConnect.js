/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
 * Gateway to the webOS API.
 * 
 * The following methods are available in the applet.
 * 
 * getDefaultDeviceId()
 *  Return the default device UID.
 * 	@return UID of the default device
 * 
 * executeNovacomCommand(deviceId, command, onDataFunc, onDisconnectFunc)
 * 	Execute the given novacom run command.
 * 	@param deviceId Device to connect to; use default device if null
 * 	@param command The command to be executed (e.g. /bin/ls)
 * 	@param onDataFunc Name of the JavaScript callback function to call when data is received
 * 	@param onDisconnectFunc Name of the JavaScript callback function to call when the connection returns
 * 	@return an interface to the connection, available methods are connected() and disconnect()
 * 
 * putFile(deviceId, src, dest)
 * 	Put a file onto the device's file system.
 *  @param deviceId Device to connect to; use default device if null
 *  @param src URL of the file to be uploaded (e.g. file:///Users/foo/wallpaper.jpg)
 *  @param dest The path of the file you want to write (e.g. /media/internal/wallpaper.jpg)
 *  
 * getFile(deviceId, src, dest)
 *  Get a file from the device's file system.
 *  @param deviceId Device to connect to; use default device if null
 *  @param src The path of the file you want to read (e.g. /media/internal/wallpaper.jpg)
 *  @param dest the path of the file you want to write (e.g. /Users/foo/wallpaper.jpg)
 */
enyo.kind({
	name: "enyo.WebosConnect",
	kind: enyo.Component,
	renderApplet: function() {
		var jar = enyo.path.rewrite("$webos/webOSconnect_1_3.jar");
		var applet = '<applet id="webosconnect" code="com.palm.webos.connect.DeviceConnection" mayscript="true" archive="' + jar + '" style="visibility: hidden"></applet>';
		/*
		var div = document.createElement("div");
		div.innerHTML = applet;
		document.body.appendChild(div);
		*/
		//document.body.previousSibling.previousSibling.innerHTML += applet;
		//document.body.innerHTML += applet;
		//
		var applet = document.createElement("applet");
		applet.setAttribute("id", "webosconnect");
		applet.setAttribute("code", "com.palm.webos.connect.DeviceConnection");
		applet.setAttribute("archive", jar);
		applet.setAttribute("mayscript", "true");
		applet.style.visibility = "hidden";
		document.body.appendChild(applet);
		//
		return enyo.WebosConnect.applet = applet; //document.getElementById("webosconnect");
	},
	fetchApplet: function() {
		return enyo.WebosConnect.applet || this.renderApplet();
	},
	execute: function() {
		if (!enyo.WebosConnect.applet) {
			this.renderApplet();
			enyo.asyncMethod(this, "_execute", arguments);
		} else {
			this._execute(arguments);
		}
	}, 
	_execute: function(inArgs) {
		enyo.WebosConnect.applet.executeNovacomCommand.apply(enyo.WebosConnect.applet, inArgs);
	}
});
