// var sound = new Howl({
//   src: ['https://r11---sn-ab5l6n7d.googlevideo.com/videoplayback?itag=22&sparams=dur%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Cratebypass%2Crequiressl%2Csource%2Cupn%2Cexpire&lmt=1472373274637338&mt=1490066782&ip=149.125.66.95&key=yt6&mime=video%2Fmp4&expire=1490088486&id=o-AJpXGHKA-AswxRpFysqXA4__WZqqluB_4gbTMx9TsXMK&upn=Rlw9a2yphuA&beids=%5B9466591%5D&mn=sn-ab5l6n7d&mm=31&ms=au&mv=m&ratebypass=yes&source=youtube&pl=22&initcwndbps=1208750&dur=225.697&requiressl=yes&ipbits=0&signature=4A077F7CAE1F5E0D26C917BECEAFE8516CF80F32.4E1402C60ED443BD5A95612A21ABE7D15FADDC1B']
// });
// var sound = new Howl({
// 	src: ['afraidofheights.mp4']
// })
// sound.on('play', function() {
// 	$("p").text("now playing");
// })
// $(document).ready(function() {
// 	sound.play();
// });
var baseurl = "https://ixwyi5tpad.execute-api.us-east-1.amazonaws.com/dev";
var mediaTypes = ["audio/webm", "audio/ogg", "audio/x-ogg", "audio/mp4", "audio/m4a", "audio/mp3", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/flac", "audio/x-flac"];
var container = {
	"webm": "audio/webm",
	"mp4": "audio/mp4"
}
// var url = "https://r11---sn-ab5l6n7d.googlevideo.com/videoplayback?source=youtube&mn=sn-ab5l6n7d&dur=225.697&ip=149.125.64.168&initcwndbps=1477500&ipbits=0&pl=22&mv=m&ms=au&mm=31&key=yt6&id=o-AHnpAFumeV_G2kfNE17c3jHWa1XM7wmpGIGFdXGe9EVW&sparams=dur%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Cratebypass%2Crequiressl%2Csource%2Cupn%2Cexpire&upn=EnxqBf86eeU&mime=video%2Fmp4&itag=22&requiressl=yes&lmt=1472373274637338&expire=1490689859&mt=1490668164&ratebypass=yes&signature=112A7B53E77D270D8857267C1A9B00D5082E2035.2CE6014BBD46E8D7E742643C08805CED6FCA7521";
var url = "afraidofheights.mp4";
var sound;
var duration;
var base64;
var snippet = undefined;
/*typing timeout variable*/
var typeTO;
var typeTimer = 800;
// $(document).ready(function() {
// 	// var query = "https://ixwyi5tpad.execute-api.us-east-1.amazonaws.com/dev?v=T60Du8Py9yA";
// 	// $.get(query, function(data) {
// 	// 	console.log(data)
// 	// })
// });
$(document).ready(pageLoadComplete);
function pageLoadComplete() {
	var $status = $("div.status"),
	$input = $("div.input"),
	$start = $($input.find("input")[0]),
	$stop = $($input.find("input")[1]),
	$rate_input =  $($input.find("input")[2]),
	$rate_p = $($input.find("p")[2]),
	url = "",
	source = "",
	dataUri = "";
	

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
		$input.hide();
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		    url = tabs[0].url;
		    var url_parameters = url.split('?');
		    url = baseurl + '?';
		    for(var i=1; i < url_parameters.length; i++) {
		    	url += url_parameters[i];
		    }
		    //console.log(url);
		    $.get(url, function(data) {
		    	console.log(data);
		    	if(data.message == "-1") {
		    		//error handling
		    		$status.find("p").text("Invalid url.");
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
		    			//console.log(source);
		    			return;
		    		}
		    	}

		    	//if a valid video type could not be found:
		    	$status.find("A valid video type could not be found");
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




