var v = require('../validate-obj');
var expect = require('chai').expect;

describe('simpleObj:', function() {

	it('required with existed prop', function() {
		expect(v.validateObj({a:1}, {a:[v.required]})).to.equal(null);
	});

	it('required with non-existed prop', function () {
		expect(v.validateObj({}, {a:[v.required]})).to.include('a is required');
	});

	it('isDate with non-existed prop', function() {
		expect(v.validateObj({}, {a:[v.isDate]})).to.equal(null);
	});

	it('isDate with existed non-Date', function() {
		expect(v.validateObj({a:1}, {a:[v.isDate]})).to.include('a is not date');
	});

	it('isDate with existed Date', function() {
		expect(v.validateObj({a: new Date()}, {a:[v.isDate]})).to.equal(null);
	});

	it('isString with non-existed prop', function() {
		expect(v.validateObj({}, {a:[v.isString]})).to.equal(null);
	});

	it('isString with existed non-string prop', function() {
		expect(v.validateObj({a: 1}, {a:[v.isString]})).to.include('a is not string');
	});

	it('isString with existed string prop', function() {
		expect(v.validateObj({a: 'abc'}, {a:[v.isString]})).to.equal(null);
	});

	it('isNumber with non-existed prop', function() {
		expect(v.validateObj({}, {a:[v.isNumber]})).to.equal(null);
	});

	it('isNumber with existed non-number prop', function() {
		expect(v.validateObj({a: 'fdas'}, {a:[v.isNumber]})).to.include('a is not number');
	});

	it('isNumber with existed number prop', function() {
		expect(v.validateObj({a: 1}, {a:[v.isNumber]})).to.equal(null);
	});

});