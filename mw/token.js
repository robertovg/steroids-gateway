//Token Business
module.exports = function(app) {
	var User = require('../models/user')(app),
	async = require('async');

	//In charge of token creation
	this.storeToken = function(req, res, next) {
		if(req.query.token && req.params.uuid){
			var query = User.findOne({uuid: req.params.uuid});
			var promise = query.exec();
			promise.then(function(doc){
				if(doc)	{
					// doc.increment(); //Not neccesarry
					doc.set({token: req.query.token});
				}else{
					doc = new User({
						uuid: req.params.uuid,
						token: req.query.token
					});
				}
				doc.save(function(err, user) {
					if (err) {
						next(err); // res.json(500, { error: err});
					}else{
						req.user = user;
						next();
					}
				});
			});
		}else{
			res.send(500, { error: 'something with params' });
		}
	};
	//Extract uuid from params and then cll findOneFromDB
	this.findOne = function(req, res, next) {
		this.findOneDB(req.params.uuid, function(user) {
			req.user = user;
			next();
		});
	};

	this.findOneFromBody = function(req, res, next) {
		this.findOneDB(req.body.uuid, function(user) {
			req.user = user;
			next();
		});
	};

	//Get the user with the id from db 
	this.findOneDB = function(uuid, cb) {
		User.findOne({ uuid: uuid}, 'uuid token sk userName',function(err, user) {
			cb(user);
		});
	};

	return this;

};
