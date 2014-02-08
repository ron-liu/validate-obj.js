var v = require('../validate-obj');
var expect = require('chai').expect;

describe('simpleObj:', function() {
	describe('one validator without array', function() {
		it('required should return ok', function() {
			expect(v.validateObj({a:1}), {a: v.required}).to.equal(null);
		});
		it('required should not return ok', function() {
			expect(v.validateObj({}, {a: v.required})).to.include('a is required');
		});
	});

	describe ('required:', function() {
		it('existed prop', function() {
			expect(v.validateObj({a:1}, {a:[v.required]})).to.equal(null);
		});
		it('non-existed prop', function () {
			expect(v.validateObj({}, {a:[v.required]})).to.include('a is required');
		});
		it ('existed prop', function() {
			expect(v.validateObj({a: 1}, {a: [v.required]})).to.equal(null);
		})
	});

	describe('isDate:', function() {
		it('isDate with non-existed prop', function() {
			expect(v.validateObj({}, {a:[v.isDate]})).to.equal(null);
		});

		it('isDate with existed non-Date', function() {
			expect(v.validateObj({a:1}, {a:[v.isDate]})).to.include('a is not date');
		});

		it('existed Date', function() {
			expect(v.validateObj({a: new Date()}, {a:[v.isDate]})).to.equal(null);
		});
	});

	describe('isString:', function() {
		it('non-existed prop', function() {
			expect(v.validateObj({}, {a:[v.isString]})).to.equal(null);
		});
		it('existed non-string prop', function() {
			expect(v.validateObj({a: 1}, {a:[v.isString]})).to.include('a is not string');
		});

		it('existed string prop', function() {
			expect(v.validateObj({a: 'abc'}, {a:[v.isString]})).to.equal(null);
		});
	});

	describe('isNumber:', function() {
		it('non-existed prop', function() {
			expect(v.validateObj({}, {a:[v.isNumber]})).to.equal(null);
		});
		it('existed non-number prop', function() {
			expect(v.validateObj({a: 'fdas'}, {a:[v.isNumber]})).to.include('a is not number');
		});

		it('existed number prop', function() {
			expect(v.validateObj({a: 1}, {a:[v.isNumber]})).to.equal(null);
		});
	});

	describe('isIn:', function() {
		it('non-existed prop', function() {
			expect(v.validateObj({}, {a:[v.isIn(['red','blue'])]})).to.equal(null);
		});

		it('existed not contained prop', function() {
			expect(v.validateObj({a: 'yellow'}, {a: [v.isIn(['red', 'blue'])]})).to.include('a must be one of (red, blue)');
		});

		it('existed contained prop', function() {
			expect(v.validateObj({a:'red'}, {a: [v.isIn(['red', 'blue'])]})).to.equal(null);
		})
	});
});