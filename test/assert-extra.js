//Place where some commons assertions will stay
var assert = require('assert');
assert.match = function (actual, expected, message) {
    if (! expected.test(actual)) {
        assert.fail(actual, expected, message || "expected {actual} to match {expected}", "match", assert.match);
    }
};

assert.isUndefined = function(val, msg) {
    assert.strictEqual(undefined, val, msg);
};

assert.isDefined = function(val, msg) {
    assert.notStrictEqual(undefined, val, msg);
};
assert.isNull = function(val, msg) {
	assert.strictEqual(null, val, msg);
}