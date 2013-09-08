// Controller for sessions 
module.exports = function(app) {
	var UpdateNow = require('../mw/updateNow')(app),
	TokenMw = require('../mw/token')(app),
	_ = require('underscore');

	var checkParams = function(req, res, next) {
		if(req.body.uuid && req.body.artist && req.body.album && req.body.track){
			next();
		}else{
			res.json(400, { error: 'Bad Params' });
		}
	};

	app.post('/updateNow',checkParams, TokenMw.findOneFromBody, function(req, res) {
		var dfd = UpdateNow.udpateNow(req.user, req.body.artist, req.body.album, req.body.track);
		dfd.done(function(lastfmRes) {
			res.json(lastfmRes);
		});
		dfd.fail(function(err) {
			res.json(502,  err );
		});
	});
};