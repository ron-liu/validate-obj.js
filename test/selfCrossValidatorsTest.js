var v = require('../validate-obj');
var expect = require('chai').expect;

describe ('SelfCrossValidators', function() {
	it ('one function should work', function() {
		var schema = {
			password: [v.isString, v.required],
			matchedPassword: [v.isString, v.required],
			selfCrossValidators : function(obj) {
				if (obj.password !== obj.matchedPassword) return 'passwords do not match';
				return undefined;
			}
		};
		expect(v.hasErrors({password:'123', matchedPassword: '123'}, schema)).to.equal(null);
		expect(v.hasErrors({password:'123', matchedPassword: 'a23'}, schema)).to.include('passwords do not match');
	});

	it ('function array should work', function() {
		var schema = {
			password: [v.isString, v.required],
			matchedPassword: [v.isString, v.required],
			selfCrossValidators : [
				function(obj) {
					if (obj.password !== obj.matchedPassword) return 'passwords do not match';
					return undefined;
				}
			]
		};
		expect(v.hasErrors({password:'123', matchedPassword: '123'}, schema)).to.equal(null);
		expect(v.hasErrors({password:'123', matchedPassword: 'a23'}, schema)).to.include('passwords do not match');
	});
});