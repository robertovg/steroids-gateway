// All sessions business
module.exports = function(app) {
	var request = require('superagent'),
	util = require('../utils/util')(app),
	Deferred = require('JQDeferred'),
	_this = this;
	//Call to last.fm scrobble 
	this.scrobble = function(user, artist, album, track, timestamp) {
		var dfdReturned = new Deferred();

		var params = {
			api_key: util.getApiKey(),
			sk: user.sk,
			method: 'track.scrobble',
			album: album,
			artist : artist,
			track: track,
			timestamp: timestamp

		};
		params.api_sig = util.generateLFSignature(params);
		//The format of the request is not used to generate the signature
		params.format = 'json';
		request
			.post('https://ws.audioscrobbler.com:443/2.0/')
			.type('form')
			.send(params)
			.end(function(err, res) {
				var resJson = null;
				try{
					resJson = JSON.parse(res.res.text);
					if(err || (resJson && resJson.error)) {
						dfdReturned.reject(resJson);
					}else {
							if(resJson.scrobbles['@attr'].ignored > 0 ) {
							dfdReturned.reject(resJson);
						}
						dfdReturned.resolve(resJson);
					}
				}catch(exception) {
					console.error(exception);
					dfdReturned.reject({ error: 11, message:'Service Offline - This service is temporarily offline. Try again later.', originalResponse: res.res.text});
				}
			});
		return dfdReturned.promise();
	};

	return this;
};