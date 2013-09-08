//Initializing Events 
module.exports = function(app) {

	var Sessions = require('../mw/session')(app);

	app.emitter.on('Steroids:tokenStored', Sessions.askForSession);

};