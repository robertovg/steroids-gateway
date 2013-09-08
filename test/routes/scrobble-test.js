var assert = require("assert"),
	app = require('../../app'),
	request = require('supertest'),
	Deferred = require('JQDeferred'),
	nock = require('nock'),
	util = require('../../utils/util')(app),
	User = require('../../models/user')(app);

describe('Testing Scrobbler Issues', function(){
	var uuid = 'ae6160a3-fc5e-4aef-b30a-30b2895b949x',
	token = '654df6548',
	session = '0d78a91411f8be18357be0697608e904';

	before(function(done) {
		var dfd = new Deferred();
		//Removing all User before creating one	
		var firstDfd = util.deleteThemAll(User, Deferred);

		firstDfd.done(function() {
			request(app)
				.get('/token/put/' + uuid)
				.query({token: token})
				.expect(200)
				.end(function(err, res) {
					if (err) return done(err);
				})
			;
		});
		// Removing event to prevent automatic askforsession call
		app.emitter.removeAllListeners('Steroids:tokenStored');
		//Creating new user "authenticated, to work with"		
		var Session = require('../../mw/session')(app);
		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('200','{"session":{"name":"robertovg24","key":"' + session +'","subscriber":"0"}}', {'Content-Type': 'application/json'});

		app.emitter.once('Steroids:tokenStored', function(user) {
			var dfdResponse = Session.askForSession(user);
			dfdResponse.done(function() {
				done();
			});
		});
	});

	it('User token shold be prepared', function(done) {
		User.findOne({ uuid: uuid}, 'uuid token sk userName', function(err, user) {
			assert.equal(user.uuid, uuid);
			assert.equal(user.sk, session);
			done();
		});
	});

	it('post /scrobbe inform if scrobble doesn\'t work', function(done) {
		// Creating fake https to use instead of Last.fm real servers
		var timestamp = 13669;

		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('200', '{ ' +
						'  "scrobbles": { ' +
						'    "scrobble": { ' +
						'      "track": { ' +
						'        "#text": "Don\'t Go No Farther", ' +
						'        "corrected": "0" ' +
						'      }, ' +
						'      "artist": { ' +
						'        "#text": "Muddy Waters", ' +
						'        "corrected": "0" ' +
						'      }, ' +
						'      "album": { ' +
						'        "#text": "The Anthology", ' +
						'        "corrected": "0" ' +
						'      }, ' +
						'      "albumArtist": { ' +
						'        "#text": "", ' +
						'        "corrected": "0" ' +
						'      }, ' +
						'      "timestamp": "' + timestamp + '", ' +
						'      "ignoredMessage": { ' +
						'        "#text": "Timestamp failed filter, too far in past", ' +
						'        "code": "3" ' +
						'      } ' +
						'    }, ' +
						'    "@attr": { ' +
						'      "accepted": "0", ' +
						'      "ignored": "1" ' +
						'    } ' +
						'  } ' +
						'} ' ,
				{'Content-Type': 'application/json'}
			);

		request(app)
			.post('/scrobble')
			.send({uuid: uuid, album: 'The Anthology', artist : 'Muddy Waters', track: 'Don\'t Go No Farther', timestamp: timestamp})
			.expect(502)
			.end(function(err, res) {
				if (err) return done(err);
				var objRes = JSON.parse(res.res.text);
				assert.equal(objRes.scrobbles.scrobble.track['#text'], 'Don\'t Go No Farther');
				assert.equal(objRes.scrobbles.scrobble.album['#text'], 'The Anthology');
				assert.equal(objRes.scrobbles.scrobble.artist['#text'], 'Muddy Waters');
				assert.equal(objRes.scrobbles.scrobble.timestamp, timestamp);
				assert.equal(objRes.scrobbles.scrobble.ignoredMessage['#text'], 'Timestamp failed filter, too far in past');
				assert.equal(objRes.scrobbles['@attr'].accepted, 0);
				assert.equal(objRes.scrobbles['@attr'].ignored, 1);
				done();
			});
	});


	it('post /scrobbe would scrobble', function(done) {
		var timestamp = 1366099200;
		// Creating fake https to use instead of Last.fm real servers
		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('200',
						'{ ' +
						'  "scrobbles": { ' +
						'    "scrobble": { ' +
						'      "track": { ' +
						'        "#text": "Don\'t Go No Farther", ' +
						'        "corrected": "0" ' +
						'      }, ' +
						'      "artist": { ' +
						'        "#text": "Muddy Waters", ' +
						'        "corrected": "0" ' +
						'      }, ' +
						'      "album": { ' +
						'        "#text": "The Anthology", ' +
						'        "corrected": "0" ' +
						'      }, ' +
						'      "albumArtist": { ' +
						'        "#text": "", ' +
						'        "corrected": "0" ' +
						'      }, ' +
						'      "timestamp": "' + timestamp + '", ' +
						'      "ignoredMessage": { ' +
						'        "#text": "", ' +
						'        "code": "0" ' +
						'      } ' +
						'    }, ' +
						'    "@attr": { ' +
						'      "accepted": "1", ' +
						'      "ignored": "0" ' +
						'    } ' +
						'  } ' +
						'}',
				{'Content-Type': 'application/json'}
			);

		request(app)
			.post('/scrobble')
			.send({uuid: uuid, album: 'The Anthology', artist : 'Muddy Waters', track: 'Don\'t Go No Farther', timestamp: timestamp })
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				var objRes = JSON.parse(res.res.text);
				assert.isNull(err);
				assert.equal(objRes.scrobbles.scrobble.track['#text'], 'Don\'t Go No Farther');
				assert.equal(objRes.scrobbles.scrobble.album['#text'], 'The Anthology');
				assert.equal(objRes.scrobbles.scrobble.artist['#text'], 'Muddy Waters');
				assert.equal(objRes.scrobbles.scrobble.timestamp, timestamp);
				done();
			});
	});



	it('post /scrobble should inform of errors', function(done) {
		// Creating fake https to use instead of Last.fm real servers
		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('200',
				' { ' +
				'	"error": 9, ' +
				'	"message": "Invalid session key - Please re-authenticate", ' +
				'	"links": [] ' +
				' } ',
				{'Content-Type': 'application/json'}
			);

		request(app)
			.post('/scrobble')
			.send({uuid: uuid, album: 'The Anthology', artist : 'Muddy Waters', track: 'Don\'t Go No Farther', timestamp: 1366099200})
			.expect(502)
			.end(function(err, res) {
				if (err) return done(err);
				var objRes = JSON.parse(res.res.text);
				assert.isNull(err);
				assert.equal(objRes.message, 'Invalid session key - Please re-authenticate');
				assert.equal(objRes.error, 9);
				done();
			});
	});

	it('post /scrobble should inform of fails', function(done) {
		// Creating fake https to use instead of Last.fm real servers
		var fakeHttps = nock('https://ws.audioscrobbler.com:443')
			.filteringRequestBody(/.*/, '*')
			.post('/2.0/','*')
			.reply('500', '500 Internal Server Error');

		request(app)
			.post('/scrobble')
			.send({uuid: uuid, album: 'The Anthology', artist : 'Muddy Waters', track: 'Don\'t Go No Farther', timestamp: 1366099200 })
			.expect(502)
			.end(function(err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('post /scrobble with bad params should response 400', function(done) {

		request(app)
			.post('/scrobble')
			.send({album: 'The Anthology', artist : 'Muddy Waters', track: 'Don\'t Go No Farther' })
			.expect(400)
			.end(function(err, res) {
				if (err) return done(err);
				done();
			});
	});
});
