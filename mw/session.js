// All sessions business
module.exports = function(app) {
	var request = require('superagent'),
	util = require('../utils/util')(app),
	Deferred = require('JQDeferred'),
	_this = this;
	//Call to last.fm for sesion
	this.askForSession = function(user) {
		var dfdReturned = new Deferred();
		var dfdInternal = new Deferred();
		var params = {
			api_key: util.getApiKey(),
			method: 'auth.getSession',
			token: user.token
		};
		params.api_sig = util.generateLFSignature(params);
		params.format = 'json';
		//Making the lasf.fm call
		request
			.post('https://ws.audioscrobbler.com:443/2.0/')
			.type('form')
			.send(params)
			.end(function(err, res) {
				var objParsed = JSON.parse(res.res.text);

				if(objParsed.session){
					_this.storeSk(
						user,
						objParsed.session.key,
						objParsed.session.name,
						function() {
							dfdReturned.resolve();
						});

				}else if(objParsed.error){
					dfdInternal.reject(objParsed.message);
				}else{
					dfdInternal.reject();
				}
			});


		// When this function fails, is needed to remove the document from db
		dfdInternal.fail(function(error) {
			user.remove(function(err, usr) {
				dfdReturned.reject(usr);
			});
		});
		return dfdReturned.promise();
	};

	// Update user row with uuid
	this.storeSk = function(user, sk, userName, next) {
		user.set({ sk: sk, userName: userName });
		user.save(function(err, doc) {
			next();
		});
	};

	return this;
};

