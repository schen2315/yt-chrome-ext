var baseurl = "https://ixwyi5tpad.execute-api.us-east-1.amazonaws.com/dev";
var mediaTypes = ["audio/webm", "audio/ogg", "audio/x-ogg", "audio/mp4", "audio/m4a", "audio/mp3", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/flac", "audio/x-flac"];
var container = {
	"webm": "audio/webm",
	"mp4": "audio/mp4"
}
var	url = "",	/* the lambda endpoint */
	source = "", /* where the video itself is stored */
	dataUri = "",
	youtube_url = ""; /* the video */

// /* parameter is a youtube url */
function init(a, callback) {
	console.log("called init function");
	if(a !== undefined && youtube_url === a) {
		var returnVal = {
			"url": url,
			"source": source,
			"dataUri": dataUri,
			"youtube_url": youtube_url
		}
		console.log(returnVal);
		callback(returnVal);
		return;
	}
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		youtube_url = tabs[0].url;
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
	    		callback(-1);
	    		return;
	    	}
	    	var videos = data.message;
	    	var type;
	    	for(var i = 0; i < videos.length; i++) {
	    		type = videos[i].container;
	    		if(type == "webm" || type == "mp4") {
	    			dataUri = "data:" + container[type] + ";base64,";
	    			source = videos[i].url;
	    			downloadAudio(callback);
	    			//callback(videos);
	    			return;
	    		}
	    	}
	    	//if a valid video type could not be found:
	    	//$status.find("A valid video type could not be found");
	    });
	});
}

function downloadAudio(callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', source, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function(e) {
		if(this.status == 200) {
			dataUri = dataUri + base64ArrayBuffer(xhr.response);
			var returnVal = {
				"url": url,
				"source": source,
				"dataUri": dataUri,
				"youtube_url": youtube_url
			}
			console.log(returnVal);
			callback(returnVal);
		}
	}
	xhr.send();
}