//Users Model
//If more than a model is needed https://github.com/j0ni/beachenergy.ca/blob/master/datamodel/index.js
module.exports = function(app) {
	var userSchema = new app.mongoose.Schema({
		uuid: {type:String, required: true, unique: true},
		token: String,
		sk: String,
		userName: String
	}, {strict: true});


	function getModel(name, schema) {
		try {
			return app.mongoose.model(name);
		} catch (e) {
			return app.mongoose.model(name, schema);
		}
	}

	return getModel('User', userSchema);
};
