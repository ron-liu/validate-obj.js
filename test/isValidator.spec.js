var v = require('../validate-obj');
var expect = require('chai').expect;

describe.only('isValidator', function() {
	it('func should ok', function() {
		expect(v.isValidator.validator(function() {})).to.equal(true);
	});

	it('string should not ok', function() {
		expect(v.isValidator.validator('123')).to.equal(false);
	})

	it('array of func should ok', function() {
		expect(v.isValidator.validator([function(){}])).to.equal(true);
	});

	it('array of func and string should not ok', function() {
		expect(v.isValidator.validator([function(){}, 's'])).to.equal(false);
	});

	it('{validatorFunc, errString} should be ok', function() {
		expect(v.isValidator.validator({
			validator: function () {},
			err: 'invalid prop'
		})).to.equal(true);
	});

	it('{validatorFunc, err} should be ok', function() {
		expect(v.isValidator.validator({
			validator: function () {},
			err: function() {}
		})).to.equal(true);
	});

	it('{validatorString, err} should not ok', function() {
		expect(v.isValidator.validator({
			validator: 'string',
			err: 'invalid prop'
		})).to.equal(false);
	})
});