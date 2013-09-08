//Some Utilities
module.exports = function(app) {
	var _ = require('underscore');
	crypto = require('crypto'),
	utf8 = require('./utf8')(),
	querystring = require('querystring');

	this.generateMongoUrl = function(obj){
		obj.hostname = (obj.hostname || 'localhost');
		obj.port = (obj.port || 27017);
		obj.db = (obj.db || 'test');
		if(obj.username && obj.password){
		return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
		}else{
		return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
		}
	};
	/**
	 * Generate the signature, to use in last.fm
	 */
	this.generateLFSignature = function(params) {
		// api_keyxxxxxxxxmethodauth.getSessiontokenxxxxxxx
		// api signature = md5("api_keyxxxxxxxxmethodauth.getSessiontokenxxxxxxxmysecret")
		var toSign = _.clone(params);
		var keys = _.keys(toSign);
		keys.sort();
		var stringToSign = '';
		for(var i in keys){
			stringToSign += keys[i] + toSign[keys[i]];
		}
		return this.signMD5(encodeUtf8(stringToSign));

	};
	this.getApiKey = function() {
		return app.get('LF_API_KEY');
	};
	//Use md5(string+secret)
	this.signMD5 = function(stringToSign) {
		var md5 = crypto.createHash('md5').update(stringToSign + app.get('LF_SECRET')).digest("hex");
		return md5;
	};
	this.generateQuerystring = function(objToSend) {
		return querystring.stringify(objToSend);
	};

	//Delete all documents of the Document given in parameter
	this.deleteThemAll = function(Document, Deferred) {
		var dfd = new Deferred();
		//just remove all Document from database
		Document.remove(function(err) {
			if(!err){
				dfd.resolve();
			}
		});
		return dfd;
	};
	this.encodeUtf8 = function(str){
		return utf8.utf8_encode(str);
	};

	return this;
};

