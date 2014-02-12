var v = require('../validate-obj');
var expect = require('chai').expect;

describe.skip('one validator without array', function() {
	it('required should return ok', function() {
		expect(v.hasErrors({a:1}), {a: v.required}).to.equal(null);
	});
	it('required should not return ok', function() {
		expect(v.hasErrors({}, {a: v.required})).to.include('a is required');
	});
});
