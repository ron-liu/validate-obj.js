var v = require('../validate-obj');
var expect = require('chai').expect;

describe('built-in validators:', function() {
	describe ('required:', function() {
		it('existed prop', function() {
			expect(v.hasErrors(1, v.required)).to.equal(null);
		});
		it('non-existed prop', function () {
			expect(v.hasErrors(null, v.required)).to.include('it is required');
		});
		it ('existed prop', function() {
			expect(v.hasErrors(undefined, v.required)).to.include('it is required');
		})
	});

	describe('isDate:', function() {
		it('undefined should pass', function() {
			expect(v.hasErrors(undefined, v.isDate)).to.equal(null);
		});

		it('int should not pass', function() {
			expect(v.hasErrors(1, v.isDate)).to.include('it is not date');
		});

		it('date should pass', function() {
			expect(v.hasErrors(new Date(), v.isDate)).to.equal(null);
		});
	});

	describe('isString:', function() {
		it('undefined should pass', function() {
			expect(v.hasErrors(undefined, v.isString)).to.equal(null);
		});
		it('int should not pass', function() {
			expect(v.hasErrors(1, v.isString)).to.include('it is not string');
		});

		it('string should pass', function() {
			expect(v.hasErrors('abc', v.isString)).to.equal(null);
		});
	});

	describe('isNumber:', function() {
		it('undefined should pass', function() {
			expect(v.hasErrors(undefined, v.isNumber)).to.equal(null);
		});
		it('string should not pass', function() {
			expect(v.hasErrors('fdas', v.isNumber)).to.include('it is not number');
		});

		it('number should pass', function() {
			expect(v.hasErrors(1, v.isNumber)).to.equal(null);
		});
	});

	describe('isIn:', function() {
		it('undefined should pass', function() {
			expect(v.hasErrors(undefined, v.isIn(null, {options: ['red','blue']}))).to.equal(null);
		});

		it('not contained should not pass', function() {
			expect(v.hasErrors('yellow', v.isIn(null, {options: ['red', 'blue']}))).to.include('it must be one of (red, blue)');
		});

		it('contained should pass', function() {
			expect(v.hasErrors('red', v.isIn(null, {options: ['red', 'blue']}))).to.equal(null);
		})
	});

	describe('minLength', function() {
		it('int should not pass', function() {
			expect(v.hasErrors(1, v.minLength(null, {min: 3}))).to.include('it must be a string and have at least 3 characters');
		});
		it('3 length should pass', function() {
			expect(v.hasErrors('abc', v.minLength(null, {min: 3}))).to.equal(null);
		})
		it('2 length should not pass', function() {
			expect(v.hasErrors('ab', v.minLength(null, {min: 3}))).to.include('it must be a string and have at least 3 characters');
		});
	})
});