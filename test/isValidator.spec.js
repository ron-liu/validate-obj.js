var v = require('../validate-obj');
var expect = require('chai').expect;

describe('isValidationExpression', function() {
	it('concrete func should ok', function() {
		var f = function(){};
		f['__validator-obj__'] = {type: 'concrete'};
		expect(v.isValidationExpression(f)).to.equal(true);
	});

	it('high order func should NOT ok', function() {
		var f = function(){};
		f['__validator-obj__'] = {type: 'highOrder'};
		expect(v.isValidationExpression(f)).to.equal(true);

	});

	it('high order func without params needed should NOT ok', function() {
		var f = function(){};
		f['__validator-obj__'] = {type: 'highOrder', needParams: false};
		expect(v.isValidationExpression(f)).to.equal(true);
	});

	it('normal func should not ok', function() {
		expect(v.isValidationExpression(function() {})).to.equal(false);
	});

	it('string should NOT ok', function() {
		expect(v.isValidationExpression('123')).to.equal(false);
	});

	it('array of normal func should NOT ok', function() {
		expect(v.isValidationExpression([function(){}])).to.equal(false);
	});

	it('array of concrete func should ok', function() {
		var f = function(){};
		f['__validator-obj__'] = {type: 'concrete'};
		expect(v.isValidationExpression([f])).to.equal(true);
	});

});