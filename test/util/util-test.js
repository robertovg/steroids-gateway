

//Some test from util
var assert = require("assert"),
	app = require('../../app'),
	util = require('../../utils/util')(app);

describe('Testing decode Uf8 function', function(){
	it('should not change the string without non-utf8 chars', function() {
		var oriString = "It's just simple string";
		var utf8String = util.encodeUtf8(oriString);
		assert.equal(oriString, utf8String);
	});

	it('should change string with non-utf8 chars', function() {
		var oriString = "pingüinos león y uñas";
		var utf8String = util.encodeUtf8(oriString);
		assert.notEqual(oriString, utf8String);
	});
});

