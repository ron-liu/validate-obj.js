var v = require('../validate-obj');
var expect = require('chai').expect;

describe('simple array,', function() {
	it('array of int should pass required', function() {
		expect(v.hasErrors([1,2], v.required)).to.equal(null);
	});

	it('array of undefined should not pass', function() {
		var ret = v.hasErrors([1, undefined, null], v.required);

		expect(ret).to.include('it[1] is required');
		expect(ret).to.include('it[2] is required');
	});
});