var v = require('../validate-obj');
var expect = require('chai').expect;

describe('one validator without array', function() {
	it('required should return ok', function() {
		expect(v.validateObj({a:1}), {a: v.required}).to.equal(null);
	});
	it('required should not return ok', function() {
		expect(v.validateObj({}, {a: v.required})).to.include('a is required');
	});
});
