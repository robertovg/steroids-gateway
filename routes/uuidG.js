//uuid Generator
var uuid = require('node-uuid');
module.exports = function(app) {
	this.uuidGenerate = function(req, res) {
		res.json({uuid: uuid.v4()});
	};
	return this;
};
