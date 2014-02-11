var v = require('../validate-obj');
var expect = require('chai').expect;

describe.only('register:', function() {
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
		}, false);

		expect(v.testRequired['__validator-obj__'].type).to.equal('highOrder');
		expect(v.testRequired['__validator-obj__'].needParams).to.equal(false);

		var f = v.testRequired('ppp');
		expect(f['__validator-obj__'].type).to.equal('concrete');
		expect(f['__validator-obj__'].needParams).to.equal(false);

		expect(f(undefined, 'age')).to.equal('ppp');

		var g = v.testRequired(function(name){ return name +' is fucked';});
		expect(g(undefined, 'age')).to.equal('age is fucked');
	})
});
