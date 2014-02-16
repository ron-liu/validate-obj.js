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
			expect(v.hasErrors(undefined, v.isIn(['red','blue']))).to.equal(null);
		});

		it('not contained should not pass', function() {
			expect(v.hasErrors('yellow', v.isIn(['red', 'blue']))).to.include('it must be one of (red, blue)');
		});

		it('not contained should not pass with custom string err', function() {
			expect(v.hasErrors('yellow', v.isIn('color is invalid', ['red', 'blue']))).to.include('color is invalid');
		});

		it('not contained should not pass with custom func err', function() {
			expect(v.hasErrors('yellow', v.isIn(function(name){return name + ' is not a valid color'}, ['red', 'blue']))).to.include('it is not a valid color');
		});

		it('contained should pass', function() {
			expect(v.hasErrors('red', v.isIn(['red', 'blue']))).to.equal(null);
		});

		it('without params should throw', function(done) {
			try {
				expect(v.hasErrors('red', v.isIn)).to.equal(null);
			}
			catch (e) {
				console.log(e);
				expect(e).to.equal('isIn has to have a array options parameter like v.isIn([\'option1\', \'option2\'])');
				done();
			}
		});
	});

	describe('minLength', function() {
		it('int should not pass', function() {
			expect(v.hasErrors(1, v.minLength([3]))).to.include('it must be a string and have at least 3 characters');
		});
		it('3 length should pass', function() {
			expect(v.hasErrors('abc', v.minLength([3]))).to.equal(null);
		})
		it('2 length should not pass', function() {
			expect(v.hasErrors('ab', v.minLength([3]))).to.include('it must be a string and have at least 3 characters');
		});
	})
});