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
		it ('empty string should treated as not qualified for required', function(){
			expect(v.hasErrors('', v.required)).to.include('it is required');
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
				expect(e).to.equal('it: isIn has to have a array options parameter like v.isIn([\'option1\', \'option2\'])');
				done();
			}
		});
	});

	describe('minLength:', function() {
		it('int should not pass', function() {
			expect(v.hasErrors(1, v.minLength([3]))).to.include('it must be a string and have at least 3 characters');
		});
		it('3 length should pass', function() {
			expect(v.hasErrors('abc', v.minLength([3]))).to.equal(null);
		})
		it('2 length should not pass', function() {
			expect(v.hasErrors('ab', v.minLength([3]))).to.include('it must be a string and have at least 3 characters');
		});
	});

	describe('isEmail', function() {
		it('valid email should pass', function() {
			expect(v.hasErrors('john@gmail.com', v.isEmail)).to.equal(null);
			expect(v.hasErrors('john.hacker@gmail.com', v.isEmail)).to.equal(null);
			expect(v.hasErrors('john+1@gmail.com', v.isEmail)).to.equal(null);
		});
		it('invalid email should not pass', function() {
			expect(v.hasErrors('johngmail.com', v.isEmail)).to.include('it is not email');
			expect(v.hasErrors('john.hacker@', v.isEmail)).to.include('it is not email');
			expect(v.hasErrors('john.hacker@gmail', v.isEmail)).to.include('it is not email');
			expect(v.hasErrors('@gmail.com', v.isEmail)).to.include('it is not email');
		});

	});

	describe('maxLength:', function() {
		it('int should not pass', function() {
			expect(v.hasErrors(1, v.maxLength([3]))).to.include('it must be a string and have at most 3 characters');
		});
		it('3 length should pass', function() {
			expect(v.hasErrors('abc', v.maxLength([3]))).to.equal(null);
		})
		it('4 length should not pass', function() {
			expect(v.hasErrors('abcd', v.maxLength([3]))).to.include('it must be a string and have at most 3 characters');
		});
	});

	describe('isCredit', function() {
		it('valid credit card should pass', function() {
			expect(v.hasErrors('5212345678901234', v.isCreditCard)).to.equal(null); // mastercard
			expect(v.hasErrors('4123456789012', v.isCreditCard)).to.equal(null); // visa 1
			expect(v.hasErrors('4123456789012345', v.isCreditCard)).to.equal(null); // visa 2
			expect(v.hasErrors('371234567890123', v.isCreditCard)).to.equal(null); // amex
			expect(v.hasErrors('601112345678901234', v.isCreditCard)).to.equal(null); // diners club
			expect(v.hasErrors('38812345678901', v.isCreditCard)).to.equal(null);
		});
		it('invalid credit card should not pass', function() {
			expect(v.hasErrors('aa444433332222', v.isCreditCard)).to.include('it is not credit card number');
			expect(v.hasErrors('dfdsafdasfds', v.isCreditCard)).to.include('it is not credit card number');
		});
	});

	describe('isUrl', function() {
		it('valid url should pass', function() {
			expect(v.hasErrors('http://www.google.com', v.isUrl)).to.equal(null);
			//expect(v.hasErrors('ftp://www.cctv.com', v.isUrl)).to.equal(null);
			expect(v.hasErrors('https://www.yahoo.com.au', v.isUrl)).to.equal(null);
			expect(v.hasErrors('http://g.cn/acdefee', v.isUrl)).to.equal(null);
			expect(v.hasErrors('http://www.abc.com?color=red&name=john', v.isUrl)).to.equal(null);
		});
		it('invalid url should not pass', function() {
			expect(v.hasErrors('httpp://www.google.com', v.isUrl)).to.include('it is not url');
			//expect(v.hasErrors('http://www .yahoo.com', v.isUrl)).to.include('it is not url');
		});
	});

	describe('isBefore', function() {
		it('valid should pass', function () {
			expect(v.hasErrors(new Date(2014,1,21,10,30,0), v.isBefore([new Date(2014,1,21,10,31,0)]))).to.equal(null);
		});
		it('invalid should pass', function () {
			expect(v.hasErrors(new Date(2014,1,21,10,30,0), v.isBefore([new Date(2014,1,21,10,29,0)]))).to.include('it is not before');
		});
	});

	describe('isAfter', function() {
		it('valid should pass', function () {
			expect(v.hasErrors(new Date(2014,1,21,10,30,0), v.isAfter([new Date(2014,1,21,10,29,0)]))).to.equal(null);
		});
		it('invalid should pass', function () {
			expect(v.hasErrors(new Date(2014,1,21,10,30,0), v.isAfter([new Date(2014,1,21,10,31,0)]))).to.include('it is not after');
		});
	});

	describe('isBool', function() {
		it('valid should pass', function () {
			expect(v.hasErrors(true, v.isBool)).to.equal(null);
		});
		it('invalid should pass', function () {
			expect(v.hasErrors('', v.isBool)).to.include('it is not bool');
		});
	});

	describe('isObject', function() {
		it ('valid should pass', function() {
			expect(v.hasErrors({}, v.isObject)).to.equal(null);
		})
		it ('invalid should pass', function() {
			expect(v.hasErrors('', v.isObject)).to.include('it is not object');
		})
	})
});