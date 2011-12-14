/**
 * jQuery Geolocation Plugin
 *
 * Version: 0.1.2
 * Created: 2011-12-12
 * Updated: 2011-12-14
 
 * Company: SiteCrafting
 * Website: https://github.com/psayre-sc/jQuery-Geolocation-Plugin
 * Authors: Paul Sayre
 *
 *
 * Basic Usage:
 *
 * $.geo().done(function (pos) {
 *   var lat = pos.lat, lng = pos.lng;
 * });
 *
 */

(function ($) {

	var defaults = {
		maximumAge: 0,
		timeout: 60e3,
		enableHighAccuracy: false,
		failToGoogle: true
	};


	var geo = window.navigator.geolocation;


	var googLoc = (function () {
		var defer;
		return function (timeout) {
			if(!defer) {
				defer = $.ajax({
					url: (window.navigator.protocol === 'https' ? 'https' : 'http')+'://www.google.com/jsapi',
					dataType: 'jsonp',
					timeout: timeout
				});
			}
			return defer;
		};
	})();


	var succ = function (defer, opts) {
		return function (pos) {
			var coords = pos.coords;
			defer.resolve({
				lat: coords.latitude,
				lng: coords.longitude,
				accr: coords.accuracy
			});
		};
	};


	var error = function (defer, opts) {
		return function (e) {
			if(opts.failToGoogle) {
				googLoc(opts.timeout)
					.done(function () {
						succ(defer)({ coords: {
							latitude: google.loader.ClientLocation.latitude,
							longitude: google.loader.ClientLocation.longitude,
							accuracy: null
						} });
					})
					.fail(function () {
						defer.reject(e);
					});
			}
			else {
				defer.reject(e);
			}
		};
	};


	$.geo = function (options) {
		var opts = $.extend({}, defaults, options),
			defer = $.Deferred();
		if(geo) {
			geo.getCurrentPosition(succ(defer, opts), error(defer, opts), opts);
		}
		else {
			error(defer, opts)();
		}
		return defer.promise();
	};

})(window.jQuery);
