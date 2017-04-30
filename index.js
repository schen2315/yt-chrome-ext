'use strict';

var baseurl = "https://ixwyi5tpad.execute-api.us-east-1.amazonaws.com/dev";
var mediaTypes = ["audio/webm", "audio/ogg", "audio/x-ogg", "audio/mp4", "audio/m4a", "audio/mp3", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/flac", "audio/x-flac"];
var container = {
	"webm": "audio/webm",
	"mp4": "audio/mp4"
}
var sound;
var duration;
var base64;
var snippet = undefined;
/*typing timeout variable*/
var typeTO;
var typeTimer = 800;

var	url = "",	/* the youtube video */
	source = "", /* where the video itself is stored */
	dataUri = "",
	youtube_url = ""; /* the video */

/* for offline testing */
var local_mp4 = "egoist.mp3";

$(document).ready(pageLoadComplete);
function pageLoadComplete() {
	/* cache DOM objects */
	var $status = $("div.status"),
	$input = $("div.input"),
	$start = $($input.find("input")[0]),
	$stop = $($input.find("input")[1]),
	$rate_input =  $($input.find("input")[2]),
	$rate_p = $($input.find("p")[2]);
	$input.hide();
	
	/* initialization */
	/* 
		get the current youtube url and send it to background page. 
		background page will then query lambda endpoint and download
		the source file. The callback will receive the dataUri. The 
		howler object is then instantiated
	*/
	
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		youtube_url = tabs[0].url;
		console.log(youtube_url);
		chrome.extension.getBackgroundPage().init(youtube_url, function(data) {
			if(data === -1) {
				$status.find("p").text("Invalid video Url.");
				return;
			}
			url = data.url;
			source = data.source;
			dataUri = data.dataUri;
			youtube_url = data.youtube_url;
			//console.log(data);
			loadAudio();
		});
	});
	
	/* for offline testing */
	//loadAudio();

	/* listener methods: */ 

	//press space to pause and play
	$(document).keyup(function(e) {
		if(e.which === 32) {
			if(sound.playing()) {
				sound.stop();
			} else { 
				if(snippet !== undefined)  {
					console.log(snippet);
					sound.play('snippet');
				}
				else sound.play(); 
			}
		}
	});

	//notify user using status if they are typing
	$start.keyup(hasTypeCompleted);
	$stop.keyup(hasTypeCompleted);


	$(document).on('input', '#slider', hasTypeCompleted);
	// $rate.input.on('input', function() {
	// 	console.log("change");
	// 	//$rate.p.text("rate: " + $rate.input.val());
	// });

	/* offset and duration should be in milliseconds */
	/* load UI */
	function loadAudio(offset, length, rate) {
			//var dataUri = "data:" + mediaTypes[3] + ";base64," + base64ArrayBuffer(xhr.response);
			//var dataUri = url;

			/* for offline testing */
			// var dataUri = local_mp4;
			var timestampTO;
			//console.log(offset, length, Number(rate));
			//console.log(offset === NaN);
			rate = rate !== undefined ? rate : 1.0;
			if(offset === undefined || length === undefined) {
				console.log("is this called?");
				snippet = undefined;
				sound = new Howl({src: [dataUri]});
			} else if(isNaN(offset) || isNaN(length)) {
				console.log("is this called?");
				snippet = undefined;
				sound = new Howl({src: [dataUri]});
			} else {
				snippet = [offset, length];
				sound = new Howl({
					src: [dataUri],
					sprite: {
						snippet: snippet
					}
				});
			}
			sound.once('load', function() {
				duration = sound.duration();
				sound.rate(rate);
				$status.find("p").text("press space");
				$input.show();
			});
			sound.on('stop', function() {
				//console.log('onstop working?');
				$status.find("p").text("press space");
				clearInterval(timestampTO);
				//show the current timestamp every millisecond
			});
			sound.on('end', function() {
				$status.find("p").text("press space");
				clearInterval(timestampTO);
			})
			sound.on('play', function() {
				//$status.find("p").text("playing");
				var time_now = isNaN(offset) ? 0 : offset;
				$status.find("p").text(millToTimeStamp(time_now));
				timestampTO = setInterval(function() {
					time_now += 1000;
					$status.find("p").text(millToTimeStamp(time_now));
				}, 1000/rate);
				//remove the timestamp status
			});
	}
	function destroyAudio() {
		sound.unload();
		$status.find("p").text("no audio loaded");
	}
	function setAudio() {
		//console.log("start: " + $start.val());
		var start = readTimeStamp($start.val());
		var stop = readTimeStamp($stop.val());
		var rate = $rate_input.val();
		console.log(start);
		console.log(stop);
		//console.log("rate: " + rate);
		if(start !== false && stop !== false && (rate >= 0.5 && rate <= 1.5)) {
			/* this is due to a currently open bug in howler.js: #627 */
			/* should remove if issue is resolved */
			if(start === 0) start = 0.001;
			if(stop <= start) {
				$status.find("p").text("invalid interval");
				return;
			}
			sound.stop();
			destroyAudio();
			$status.find("p").text("loading");
			loadAudio(start*1000, (stop - start)*1000, rate);
		} else {
			console.log('what')
			$status.find("p").text("invalid interval");
		}
	}
	//convert a standard video timestamp (ex: 1:40) to sec (100 sec)
	//if timestamp is incorrect return false
	function readTimeStamp(str) {
		//check that timestamp is correct
		//ignore incorrect ones
		var split = str.split(":");

		var total_seconds = 0;
		var unit = 1;
		for(var i=split.length - 1; i >= 0; i--) {
			total_seconds += parseInt(split[i])*unit;
			unit *= 60;
		}
		//console.log(str);
		console.log("total seconds: " + total_seconds);
		console.log(duration);
		if(total_seconds < 0 || total_seconds > duration) {
			console.log("invalid timestamp")
			return false;
		}
		return total_seconds;
	}
	function millToTimeStamp(num) {
		var tot_sec = Math.floor(num / 1000);
		var min = Math.floor(tot_sec / 60);
		var sec = tot_sec - (60*min);
		if(sec < 10) sec = "0" + sec.toString();
		return min.toString() + ":" + sec;
	}
	function readRate(str) {
		var rate = parseInt(str);
	}
	//write a function to test whether the user is still typing
	//if after a set # of seconds, if the keyup event has not fired
	//clear the "typing" notification
	function hasTypeCompleted() {
		if(typeTO != undefined) clearTimeout(typeTO);
		$status.find("p").text("typing...");
		typeTO = setTimeout(setAudio, typeTimer);
	}

	// function init() {
	// 	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
	// 	    url = tabs[0].url;
	// 	    var url_parameters = url.split('?');
	// 	    url = baseurl + '?';
	// 	    for(var i=1; i < url_parameters.length; i++) {
	// 	    	url += url_parameters[i];
	// 	    }
	// 	    //query my aws lambda function for the 
	// 	    //source url and video properties
	// 	    $.get(url, function(data) {
	// 	    	console.log(data);
	// 	    	if(data.message == "-1") {
	// 	    		//error handling
	// 	    		//$status.find("p").text("Invalid url.");
	// 	    		return;
	// 	    	}
	// 	    	var videos = data.message;
	// 	    	var type;
	// 	    	for(var i = 0; i < videos.length; i++) {
	// 	    		type = videos[i].container;
	// 	    		if(type == "webm" || type == "mp4") {
	// 	    			dataUri = "data:" + container[type] + ";base64,";
	// 	    			source = videos[i].url;
	// 	    			downloadAudio();
	// 	    			return;
	// 	    		}
	// 	    	}

	// 	    	//if a valid video type could not be found:
	// 	    	//$status.find("A valid video type could not be found");
	// 	    });
	// 	});
	// }	
	// function downloadAudio() {
	// 	var xhr = new XMLHttpRequest();
	// 	xhr.open('GET', source, true);
	// 	xhr.responseType = 'arraybuffer';
	// 	xhr.onload = function(e) {
	// 		if(this.status == 200) {
	// 			dataUri = dataUri + base64ArrayBuffer(xhr.response);
	// 			loadAudio();
	// 		}
	// 	}
	// 	xhr.send();
	// }
}




