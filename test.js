var fs = require('fs');
var parse = require('url').parse;
var ytdl = require('ytdl-core');
var url = 'https://www.youtube.com/watch?v=MvK-3Ms3m34';

ytdl.getInfo(url, {}, function(a, b) {
	console.log(parse(b.formats[0].url).href);	

	//console.log(typeof parse(b.formats[0].url))
});
// ytdl(url, { filter: function(format) { return format.container === 'mp4'; } })
//   .pipe(fs.createWriteStream('afraidofheights.mp4'));

