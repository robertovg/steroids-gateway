//Just some hi level test
var assert = require("assert"),
	app = require('../../app'),
	request = require('supertest'),
	Deferred = require('JQDeferred'),
	nock = require('nock'),
	util = require('../../utils/util')(app),
	User = require('../../models/user')(app);



describe('Testing Token Issues', function(){
	before(function(done) {
		// Removing event to prevent automatic askforsession call
		app.emitter.removeAllListeners('Steroids:tokenStored');
		done();
	});

	beforeEach(function(done) {
		var dfd = util.deleteThemAll(User, Deferred);

		dfd.done(function() {
			done();
		});
	});

	after(function(done) {
		var dfd = util.deleteThemAll(User, Deferred);

		dfd.done(function() {
			done();
		});

	});

	it('should response ', function(done) {
		request(app).get('/')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('/token/put should create a brand new user in db', function(done) {
		var dfd = new Deferred();
		var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949a';
		var token = '654df6541';
		// Make the request to create a new user
		request(app)
			.get('/token/put/' + uuid)
			.query({token: token})
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				dfd.resolve();
			})
		;
		// Validate the function
		dfd.done(function() {
			User.findOne({uuid: uuid}, function(err, user) {
				assert.equal(user.token,token);
				done();
			});
		});
	});

	it('/token/put should respond correctly', function(done) {
		// Make the request to create a new user
		request(app)
			.get('/token/put/' + 'ae6160a3-fc5e-4aef-b30a-30b2895b949b')
			.query({token: '654df6542'})
			.expect(200)
			.expect('Content-Type', /text\/html/)
			.end(function(err, res) {
				if (err) return done(err);
				assert.match(res.res.text, /Done/g);
				done();
			})
		;
	});

	it('/token/put should emmit an event when it finishes', function(done) {
		var callback = function() {
			assert.ok(true, 'running');
			done();
		};
		app.emitter.once('Steroids:tokenStored', callback);
		// Make the request to create a new user
		request(app)
			.get('/token/put/' + 'ae6160a3-fc5e-4aef-b30a-30b2895b949c')
			.query({token: '654df6543'})
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
			});
	});


	it('token/:id should response the actual token', function(done) {
		var dfd = new Deferred();
		var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949d';
		var token = '654df6544';
		// Calling to token/:id to know if it works ok
		dfd.done(function() {
			request(app)
				.get('/token/' + uuid)
				.expect(200)
				.expect('Content-Type', /json/)
				.end(function(err, res) {
					if (err) return done(err);
					var objResult = JSON.parse(res.res.text);
					assert.isUndefined(objResult.token);
					assert.equal(objResult.uuid, uuid);
					done();
				})
			;
		});
		//Simulating User callback
		request(app)
			.get('/token/put/' + uuid)
			.query({token: token})
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				dfd.resolve();
			})
		;
	});

	it('token/:id should response the actual after last.fm response', function(done) {
		var dfd = new Deferred();
		var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949d';
		var token = '654df6544';
		// Require mw/session
		var Session = require('../../mw/session')(app);
		// Creating fake https to use instead of Last.fm real servers
		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('200','{"session":{"name":"robertovg24","key":"0d78a91401f8be18357be0697608e905","subsc riber":"0"}}', {'Content-Type': 'application/json'});
		// Intercepting stored event, to have the control over the last.fm request
		app.emitter.once('Steroids:tokenStored', function(user) {
			var dfdResponse = Session.askForSession(user);
			dfdResponse.done(function() {
				dfd.resolve();
			});
		});
		// Calling to token/:id to know if it works ok
		dfd.done(function() {
			request(app)
				.get('/token/' + uuid)
				.expect(200)
				.expect('Content-Type', /json/)
				.end(function(err, res) {
					if (err) return done(err);
					var objResult = JSON.parse(res.res.text);
					assert.isUndefined(objResult._id);
					assert.isUndefined(objResult.sk);
					assert.isUndefined(objResult.token);
					assert.equal(objResult.uuid, uuid);
					assert.equal(objResult.userName, 'robertovg24');
					done();
				})
			;
		});
		//Simulating User callback
		request(app)
			.get('/token/put/' + uuid)
			.query({token: token})
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
			})
		;
	});

	it('mw/session#askForSession should store session correctly', function(done) {
		var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949e';
		var token = '654df6545';
		// Require mw/session
		var Session = require('../../mw/session')(app);
		// Creating fake https to use instead of Last.fm real servers
		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('200','{"session":{"name":"robertovg24","key":"0d78a91401f8be18357be0697608e905","subsc riber":"0"}}', {'Content-Type': 'application/json'});
		// Intercepting stored event, to have the control over the last.fm request
		app.emitter.once('Steroids:tokenStored', function(user) {
			var dfdResponse = Session.askForSession(user);
			dfdResponse.done(function() {
				//Assertions
				User.findOne({uuid: user.uuid}, function(err, userStored) {
					assert.equal(userStored.uuid, uuid);
					assert.equal(userStored.token, token);
					assert.equal(userStored.sk, '0d78a91401f8be18357be0697608e905');
					assert.equal(userStored.userName, 'robertovg24');
					done();
				});
			});
		});
		//Simulating User callback
		request(app)
			.get('/token/put/' + uuid)
			.query({token: token})
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
			})
		;
	});

	it('mw/session#askForSession what happens if lasf.fm fails', function(done) {
		var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949f';
		var token = '654df6546';
		// Require mw/session
		var Session = require('../../mw/session')(app);
		// Creating fake https to use instead of Last.fm real servers
		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('200','{"error":10,"message":"Invalid API key - You must be granted a valid key by last .fm","links":[]}', {'Content-Type': 'application/json'});
		// Intercepting stored event, to have the control over the last.fm request
		app.emitter.once('Steroids:tokenStored', function(user) {
			var dfdResponse = Session.askForSession(user);
			dfdResponse.fail(function(err) {
				//Assertions
				User.count({uuid: user.uuid}, function(err, count) {
					assert.equal(count, 0);
					done();
				});
			});
		});
		//Simulating User callback
		request(app)
			.get('/token/put/' + uuid)
			.query({token: token})
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
			})
		;
	});
});


