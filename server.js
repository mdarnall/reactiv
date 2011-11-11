var express = require('express'),
faye = require('faye'),
TwitterNode = require('twitter-node').TwitterNode, 
sys = require('sys'),
util = require('util'),
twitCount = 0, 
twit = new TwitterNode({
	user: "",
	password: "",
	locations: [ -168, -60, 168, 83 ] // give a bounding box
	}), 
	bayeux = new faye.NodeAdapter({
		mount: '/faye',
		timeout: 45
		}), 
		app = express.createServer();

		// configure express
		app.configure(function() {
			app.use(express.bodyParser());
			app.use(express.static(__dirname + '/public'));
		});
		bayeux.attach(app);
		app.listen(8001);


		// configure twitter client
		twit.addListener('error', function(error) {
			console.log(error.message);
		});

		twit.addListener('tweet',function(tweet) {
			if ( !! tweet.geo) {

				if (twitCount++ % 15 === 0) {

					sys.puts("@" + tweet.user.screen_name + ": " + tweet.text);
					sys.puts("geo --> " + util.inspect(tweet.geo, true, null));


					bayeux.getClient().publish('/channel', {
						"city": tweet.user.screen_name,
						"lat": tweet.geo.coordinates[0],
						"long": tweet.geo.coordinates[1]

					});
				}
			}
		}).addListener('limit', function(limit) {
			sys.puts("LIMIT: " + sys.inspect(limit));
		}).addListener('delete', function(del) {
			sys.puts("DELETE: " + sys.inspect(del));
		}).addListener('end', function(resp) {
			sys.puts("wave goodbye... "
			//+ util.inspect(resp,true,null));
		);
	});
twit.stream();
