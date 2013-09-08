// Controller for sessions 
module.exports = function(app) {
	var TokenMw = require('../mw/token')(app);

	app.get('/session/:uuid',TokenMw.findOne, function(req, res) {
		if(!req.user) {
			res.json({ status:'non-existent' });
		}else if(!req.user.sk) {
			res.json({ status:'working' });
		}else if(req.user.sk) {
			res.json({ status: 'done' });
		}
	});
};