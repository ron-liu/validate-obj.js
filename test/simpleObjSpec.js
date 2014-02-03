var v = require('../validate-obj');
var expect = require('chai').expect;

describe('simpleObj:', function() {
	it('should pass', function() {
		expect(v.validateObj({a:1}, {a:[v.required]})).to.equal(null);
	})
})