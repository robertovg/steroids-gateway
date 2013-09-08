//Controller for token's things
module.exports = function(app) {

	var TokenMw = require('../mw/token')(app),
	_ = require('underscore');

	// I have to use GET for creating becouse of last.fm Custom callback url works only with GET
	app.get('/token/put/:uuid', TokenMw.storeToken, function(req, res) {
		app.emitter.emit('Steroids:tokenStored', req.user);
		res.render('tokenSaved', {
			title: 'AudioStation Steroids Gateway'
			}
		);
	});

	app.get('/token/:uuid', TokenMw.findOne, function(req, res) {
		res.json(req.user ? _.pick(req.user, 'uuid', 'userName') : {});
	});
};