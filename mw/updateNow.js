// All sessions business
module.exports = function(app) {
	var request = require('superagent'),
	util = require('../utils/util')(app),
	Deferred = require('JQDeferred'),
	_this = this;
	//Call to last.fm updateNow
	this.udpateNow = function(user, artist, album, track) {
		var dfdReturned = new Deferred();

		var params = {
			api_key: util.getApiKey(),
			sk: user.sk,
			method: 'track.updateNowPlaying',
			album: album,
			artist : artist,
			track: track
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
				}catch(exception) {
					dfdReturned.reject({ error: 11, message:'Service Offline - This service is temporarily offline. Try again later.', originalResponse: res.res.text});
				}
				if(err || (resJson && resJson.error)) dfdReturned.reject(resJson);
				dfdReturned.resolve(resJson);
			});



		return dfdReturned.promise();
	};

	return this;
};

