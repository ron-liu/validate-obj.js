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

		each(options, function (validators, propName) {
			var fullName = namespace + propName;

			if (isObject(options[propName]) && !isArray(options[propName])) {
				if (!isObject(obj[propName])) throw propName + ' in validator is an object, while ' + propName +' in object is not';
				validateObject(obj[propName], options[propName], fullName + '.');
				return;
			}

			if (isArray(obj[propName])) {
				each(obj[propName], function(member){
					viaValidators(validators, member);
				});
				return;
			}
			viaValidators(validators, obj[propName]);

			function viaValidators(validators, prop) {
				each(validators, function (validate) {
					var err = validate(prop, fullName);
					if (err) errs.push(err);
				});
			}
		});

		return some(errs) ? errs : null;
	}

	function isObject (o) {
		return typeof o === "object";
	}

	function each(obj, fn) {
		for(var name in obj) {
			fn(obj[name], name);
		}
	}

	function some(a) {
		if (!isArray(a)) return false;
		return a.length > 0;
	}

	function isArray(a) {
		return Object.prototype.toString.call(a) === "[object Array]";
	}

	function getValidateFunc(validate, errString) {
		return function(prop, name) {
			if (!existy(prop)) return undefined;
			if (!validate(prop)) return errString(name);
			return undefined;
		};
	}

	return {
		validateObj: validateObject,

		required: function  (prop, name) {
			function existy(x) {
				return x !== null;
			}
			if (!existy(prop)) return name + ' is required';
			return undefined;
		},

		isDateTime: function (prop, name) {
			return getValidateFunc(_.isDate, function(name) {return sprintf('%s is not date', name);})(prop, name);
		},

		isString: function (prop, name) {
			return getValidateFunc(_.isString, function(name) {return sprintf('%s is not string', name);})(prop, name);
		},

		enums: function (opts) {
			return getValidateFunc(
				function (prop) {return _.contains(opts, prop);},
				function (name) {
					return sprintf('%s must be one of (%s)', name,
						_.reduce(opts, function(whole, opt) {return sprintf('%s, %s', whole, opt);}));
				}
			);
		},
		isNumber: function (prop, name) {
			return getValidateFunc(_.isNumber, function(name) {return sprintf('%s is not a number', name);})(prop, name);
		},

		minLength: function (min) {
			return getValidateFunc(
				function(prop) {return _.isString(prop) && prop.length >= min;},
				function(name) {return sprintf('%s must have at least %d characters', name, min); }
			);
		}
	}
});