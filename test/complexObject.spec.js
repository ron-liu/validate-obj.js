var v = require('../validate-obj');
var expect = require('chai').expect;

describe('invalid validation expression', function() {
	it('int is invalid validation expression', function(done) {
		try{
			v.hasErrors({}, 1);
		}
		catch(e)
		{
			expect(e).to.equal('invalid validation expression: it');
			done();
		}
	});
	it('isNumber is valid expression', function() {
		v.hasErrors({}, v.isNumber);
	})
});

describe('nested obj', function() {
	it ('right 1 level should pass', function() {
		var ret = v.hasErrors({a:1, b:'s', c:new Date()}, {a: v.isNumber, b: v.isString, c: v.isDate});
		expect(ret).to.equal(null);
	});
	it ('wrong 1 level should pass', function() {
		var ret = v.hasErrors({a:'a', b:'s', c:new Date()}, {a: v.isNumber, b: v.isString, c: v.isDate, d: v.required});
		expect(ret).to.include('it.a is not number');
		expect(ret).to.include('it.d is required');
	});

	describe('2 level', function() {
		var validationExpression;

		beforeEach(function() {
			validationExpression = {
				total: [v.isNumber, v.required],
				happenedOn: v.isDate,
				customer: {
					name: [v.isString, v.required],
					address: v.isString
				}
			};
		});

		it('right 2 level should pass', function() {
			 var ret =v.hasErrors( {
					total: 10.95,
					happenedOn: new Date(),
					customer: {
						name: 'ron',
						address: 'station road'
					}
				}, validationExpression);
			expect(ret).is.equal(null);
		});

		it('wrong 2nd level should not pass', function() {
			var ret =v.hasErrors( {
				total: 10.95,
				happenedOn: new Date(),
				customer: {
					name: 'ron',
					address: 11
				}
			}, validationExpression);

			expect(ret).is.include('it.customer.address is not string');
		});

		it('missed 1 level node should not pass', function() {
			var ret =v.hasErrors( {
				total: 10.95,
				happenedOn: new Date()
			}, validationExpression);

			expect(ret).is.include('it.customer.name is required');
		});
	});

	describe('simple array', function() {
		it('array expression with non array target should not ok', function() {
			expect(v.hasErrors(1, [[v.isNumber]])).to.include('it is not array');
		});

		it('non array expression with array target should not ok', function() {
			expect(v.hasErrors([1], v.isNumber)).to.include('it is not number');
		});

		it('array express with array target should be ok', function() {
			expect(v.hasErrors([1], [[v.isNumber]])).to.equal(null);
		});

		it('array of int should pass required', function() {
			expect(v.hasErrors([1,2], v.required)).to.equal(null);
		});

		it('array of undefined should not pass', function() {
			var ret = v.hasErrors([1, undefined, null], [[v.required]]);

			expect(ret).to.include('it[1] is required');
			expect(ret).to.include('it[2] is required');
		});
	});

	describe('object in array', function() {
		it('array object validation express with non array target should not pass', function() {
			var target = {
				customerName: 'ron',
				items: {
					no: '1',
					sku: 123
				}
			};
			var expression = {
				customerName: v.isString,
				items: [{
					no: v.isString,
					sku: v.isNumber
				}]
			};
			var ret = v.hasErrors(target, expression);
			expect(ret).is.include('it.items is not array');
		});

		it('array object validation express with array target, but invalid data should not pass', function() {
			var target = {
				customerName: 'ron',
				items: [{
					no: '1',
					sku: 'abc'
				}]
			};
			var expression = {
				customerName: v.isString,
				items: [{
					no: v.isString,
					sku: v.isNumber
				}]
			};
			var ret = v.hasErrors(target, expression);
			expect(ret.length).to.equal(1);
			expect(ret).is.include('it.items[0].sku is not number');
		});

		it('array object validation express with array target, but invalid data should not pass', function() {
			var target = {
				customerName: 'ron',
				items: [{
					no: new Date(),
					sku: 234
				}, {
					no: '1',
					sku: 'a'
				}]
			};
			var expression = {
				customerName: v.isString,
				items: [{
					no: v.isString,
					sku: v.isNumber
				}]
			};
			var ret = v.hasErrors(target, expression);
			expect(ret.length).to.equal(2);
			expect(ret).is.include('it.items[1].sku is not number');
			expect(ret).is.include('it.items[0].no is not string');
		});

		it('array object validation express with array target, and valid data should pass', function() {
			var target = {
				customerName: 'ron',
				items: [{
					no: '1',
					sku: 123
				}]
			};
			var expression = {
				customerName: v.isString,
				items: [{
					no: v.isString,
					sku: v.isNumber
				}]
			};
			var ret = v.hasErrors(target, expression);
			expect(ret).is.equal(null);
		});
	});
})