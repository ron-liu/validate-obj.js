//     validate-obj.js 1.5.2
//     (c) 2009-2014 Ron Liu
//     validate-obj may be freely distributed under the MIT license.

(function (name, definition) {
	if (typeof module !== 'undefined') {
		module.exports = definition();
	} else if (typeof define === 'function' && typeof define.amd === 'object') {
		define(definition);
	} else {
		this[name] = definition();
	}
})('validate-obj', function (validator) {

	function validateObject(obj, options, namespace) {
		var errs = [];

		namespace = namespace || '';

		_each(options, function (validators, propName) {
			var fullName = namespace + propName;

			if (_isObject(options[propName]) && !_isArray(options[propName])) {
				if (!_isObject(obj[propName])) throw _sprintf('%s in validator is an object, while %s in object is not', propName, propName);
				validateObject(obj[propName], options[propName], fullName + '.');
				return;
			}

			if (_isArray(obj[propName])) {
				_each(obj[propName], function(member){
					viaValidators(validators, member);
				});
				return;
			}
			viaValidators(validators, obj[propName]);

			function viaValidators(validators, propValue) {
				_each(validators, function (validate) {
					if (typeof propValue === 'undefined' &&  validate.name !== 'required' ) return;
					var err = validate(propValue, fullName, obj);
					if (err) errs.push(err);
				});
			}
		});

		return _some(errs) ? errs : null;
	}

	function _isObject (o) {
		return typeof o === "object";
	}

	function _each(obj, fn) {
		for(var name in obj) {
			fn(obj[name], name);
		}
	}

	function _some(a) {
		if (!_isArray(a)) return false;
		return a.length > 0;
	}

	function _isArray(a) {
		return Object.prototype.toString.call(a) === "[object Array]";
	}

	function _isDate(d) {
		return Object.prototype.toString.call(d) === "[object Date]";
	}

	function _isString(s) {
		return typeof s === 'string';
	}

	function _isNumber(s) {
		return typeof s === 'number';
	}

	function _getValidateFunc(validate, errString) {
		return function(value, name) {
			if (!validate(value)) return errString(name);
			return undefined;
		};
	}

	function _sprintf(str)
	{
		if (typeof str !== 'string') throw 'the 1st argument should be string';
		var parts = str.split('%s');
		if (parts.length != arguments.length) throw 'the number of %s in string is not equal to the number of variables';
		var ret = parts[0];
		for (var i = 1; i < arguments.length; i ++) {
			ret += arguments[i] + parts[i];
		}
		return ret;
	}

	function _existy(obj, prop) {
		return obj[prop] !== undefined;
	}

	return {
		validateObj: validateObject,

		required: function required(value, name, obj) {
			if (!_existy(obj, name)) return name + ' is required';
			return undefined;
		},

		isDate: function (value, name) {
			return _getValidateFunc(_isDate, function(name) {return _sprintf('%s is not date', name);})(value, name);
		},

		isString: function (value, name) {
			return _getValidateFunc(_isString, function(name) {return _sprintf('%s is not string', name);})(value, name);
		},

		isNumber: function (value, name) {
			return _getValidateFunc(_isNumber, function(name) {return _sprintf('%s is not number', name);})(value, name);
		},

		isIn: function (opts) {
			return _getValidateFunc(
				function (prop) {return _.contains(opts, prop);},
				function (name) {
					return _sprintf('%s must be one of (%s)', name,
						_.reduce(opts, function(whole, opt) {return _sprintf('%s, %s', whole, opt);}));
				}
			);
		},

		minLength: function (min) {
			return _getValidateFunc(
				function(prop) {return _.isString(prop) && prop.length >= min;},
				function(name) {return _sprintf('%s must have at least %d characters', name, min); }
			);
		}
	}
});