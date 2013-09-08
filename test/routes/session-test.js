//Just some hi level test
var assert = require("assert"),
	app = require('../../app'),
	request = require('supertest'),
	Deferred = require('JQDeferred'),
	nock = require('nock'),
	util = require('../../utils/util')(app),
	User = require('../../models/user')(app),
	i = 0;

describe('Testing Session Issues', function(){
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
	it('session/:uuid if don not exist status=non-existent', function(done) {
		var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949g';
		//Simulating User callback
		request(app)
			.get('/session/' + uuid + '/')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				var objRes = JSON.parse(res.res.text);
				assert.equal(objRes.status, 'non-existent');
				done();
			})
		;
	});
	it('session/:uuid if is not last.fm signed status=working', function(done) {
		var dfd = new Deferred();
		var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949g';
		var token = '654df6547';
		// Calling to session/:id to know if it works ok
		dfd.done(function() {
			request(app)
				.get('/session/' + uuid)
				.expect(200)
				.expect('Content-Type', /json/)
				.end(function(err, res) {
					if (err) return done(err);
					var objRes = JSON.parse(res.res.text);
					assert.equal(objRes.status, 'working');
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
	it('session/:uuid if is last.fm signed status=done', function(done) {
		var dfd = new Deferred();
		var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949g';
		var token = '654df6547';

		// Require mw/session
		var Session = require('../../mw/session')(app);
		// Creating fake https to use instead of Last.fm real servers
		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('200','{"session":{"name":"robertovg24","key":"0d78a91411f8be18357be0697608e905","subsc riber":"0"}}', {'Content-Type': 'application/json'});
		// Intercepting stored event, to have the control over the last.fm request
		app.emitter.once('Steroids:tokenStored', function(user) {
			var dfdResponse = Session.askForSession(user);
			dfdResponse.done(function() {
					dfd.resolve();
			});
		});

		// Calling to session/:id to know if it works ok		
		dfd.done(function() {
			request(app)
				.get('/session/' + uuid)
				.expect(200)
				.expect('Content-Type', /json/)
				.end(function(err, res) {
					if (err) return done(err);
					var objRes = JSON.parse(res.res.text);
					assert.equal(objRes.status, 'done');
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
});