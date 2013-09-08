
/*
 * Routing Index
 */
module.exports = function(app) {

	var uuidG = require('./uuidG')(app);
	var token = require('./token')(app);
	var session = require('./session')(app);
	var updateNow = require('./updateNow')(app);
	var scrobble = require('./scrobble')(app);

	app.get('/', function(req, res) {
		res.render('index', { title: 'AudioStation Steroids Gateway'});
	});

	app.get('/uuid', uuidG.uuidGenerate);
	module.exports = app;
};


