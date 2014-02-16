var v = require('../validate-obj');
var expect = require('chai').expect;

describe('register:', function() {
	it('1 parameter should NOT work', function(done) {
		try{
			v.register(function(){});
		}
		catch (e) {
			done();
		}
	});

	it ('3 parameter should work', function() {
		v.register('testRequired', function(v, name, err) {
			if (v == undefined) {
				return typeof err === 'string' ? err : err(name);
			}
			return true;
		});

		expect(v.testRequired['__validator-obj__'].type).to.equal('highOrder');

		var f = v.testRequired('ppp');
		expect(f['__validator-obj__'].type).to.equal('concrete');

		expect(f(undefined, 'age')).to.equal('ppp');

		var g = v.testRequired(function(name){ return name +' is fucked';});
		expect(g(undefined, 'age')).to.equal('age is fucked');
	});
});

describe('build:', function() {
	it('validate function and err function provided should ok', function() {
		var f = v.build(
			function(v) {return typeof v === 'string';},
			function(n) {return n + ' is not a string';}
		);
		expect(f('deals/123', 'dealName')).to.equal(null);
		expect(f(1, 'dealName')).to.equal('dealName is not a string');
		expect(f(1, 'dealName', 'fucked')).to.equal('fucked');
	});

	it ('only validate function should ok', function() {
		var f = v.build(
			function(v) {return typeof v === 'string';}
		);
		expect(f('deals/123', 'dealName')).to.equal(null);
		expect(f(1, 'dealName')).to.equal('dealName is invalid');
		expect(f(1, 'dealName', 'fucked')).to.equal('fucked');
	})
});
