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
	dataUri = ""; /* the video */
$(document).ready(pageLoadComplete);
function pageLoadComplete() {
	console.log("page load complete")
	var $status = $("div.status"),
	$input = $("div.input"),
	$start = $($input.find("input")[0]),
	$stop = $($input.find("input")[1]),
	$rate_input =  $($input.find("input")[2]),
	$rate_p = $($input.find("p")[2]);
	$input.hide();
	init();

	//loadAudio();
	//listener methods:
	$(document).keyup(function(e) {
		//console.log(snippet);
		if(e.which === 32) {
			if(sound.playing()) {
				sound.stop();
			} else { 
				if(snippet !== undefined) sound.play('snippet');
				else sound.play(); 
			}
		}
	});
	$start.keyup(hasTypeCompleted);
	$stop.keyup(hasTypeCompleted);
	$(document).on('input', '#slider', hasTypeCompleted);
	// $rate.input.on('input', function() {
	// 	console.log("change");
	// 	//$rate.p.text("rate: " + $rate.input.val());
	// });

	/*offset and duration should be in milliseconds*/
	/*load UI*/
	function loadAudio(offset, duration, rate) {
			//var dataUri = "data:" + mediaTypes[3] + ";base64," + base64ArrayBuffer(xhr.response);
			//var dataUri = url;
			rate = rate !== undefined ? rate : 1.0;
			if(offset == undefined || duration == undefined) sound = new Howl({src: [dataUri]});
			else {
				snippet = [offset, duration];
				sound = new Howl({
					src: [dataUri],
					sprite: {
						snippet: snippet
					}
				});
			}
			//console.log(snippet);
			sound.once('load', function() {
				//console.log(sound.duration());
				duration = sound.duration();
				sound.rate(rate);
				$status.find("p").text("finished loading");
				$input.show();
			});
			sound.on('stop', function() {
				$status.find("p").text("reset");
			});
			sound.on('play', function() {
				$status.find("p").text("playing");
			});
	}
	function destroyAudio() {
		sound.unload();
		$status.find("p").text("no audio loaded");
	}
	function setAudio() {
		// $this = $(this);
		// //wait for the user to stop typing
		// //get timestamps in seconds
		// //if they are false, ignore them
		// if($this.is($start) || $this.is($stop)) {
		// 	sound.stop();
		// 	console.log("start: " 
		// 		+ readTimeStamp($start.val()) + "\n" 
		// 		+ "stop: " + readTimeStamp($stop.val()));
		// }
		$status.find("p").text("reset");
		sound.stop();
		console.log("start: " + $start.val());
		var start = readTimeStamp($start.val());
		var stop = readTimeStamp($stop.val());
		var rate = $rate_input.val();
		console.log(start);
		console.log(stop);
		console.log("rate: " + rate);
		if(start != false && stop != false && (rate >= 0.5 && rate <= 1.5)) {
			destroyAudio();
			$status.find("p").text("loading");
			loadAudio(start*1000, (stop - start)*1000, rate);
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
		console.log(str);
		console.log("total seconds: " + total_seconds);
		return total_seconds;
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

	function init() {
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		    url = tabs[0].url;
		    var url_parameters = url.split('?');
		    url = baseurl + '?';
		    for(var i=1; i < url_parameters.length; i++) {
		    	url += url_parameters[i];
		    }
		    //query my aws lambda function for the 
		    //source url and video properties
		    $.get(url, function(data) {
		    	console.log(data);
		    	if(data.message == "-1") {
		    		//error handling
		    		//$status.find("p").text("Invalid url.");
		    		return;
		    	}
		    	var videos = data.message;
		    	var type;
		    	for(var i = 0; i < videos.length; i++) {
		    		type = videos[i].container;
		    		if(type == "webm" || type == "mp4") {
		    			dataUri = "data:" + container[type] + ";base64,";
		    			source = videos[i].url;
		    			downloadAudio();
		    			return;
		    		}
		    	}

		    	//if a valid video type could not be found:
		    	//$status.find("A valid video type could not be found");
		    });
		});
	}	
	function downloadAudio() {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', source, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(e) {
			if(this.status == 200) {
				dataUri = dataUri + base64ArrayBuffer(xhr.response);
				loadAudio();
			}
		}
		xhr.send();
	}
}




