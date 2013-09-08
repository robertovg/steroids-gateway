// Controller for sessions 
module.exports = function(app) {
	var Scrobble = require('../mw/scrobble')(app),
	TokenMw = require('../mw/token')(app),
	_ = require('underscore');

	var checkParams = function(req, res, next) {
		if(req.body.uuid && req.body.artist && req.body.album && req.body.track && req.body.timestamp){
			next();
		}else{
			res.json(400, { error: 'Bad Params' });
		}
	};

	app.post('/scrobble',checkParams, TokenMw.findOneFromBody, function(req, res) {
		var dfd = Scrobble.scrobble(req.user, req.body.artist, req.body.album, req.body.track, req.body.timestamp);
		dfd.done(function(lastfmRes) {
			res.json(lastfmRes);
		});
		dfd.fail(function(err) {
			res.json(502,  err );
		});
	});
};

