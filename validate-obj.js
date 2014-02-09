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

	// small set of underscore
	var u = {
		isObject : function(o) {
			return typeof o === "object";
		},

		each: function(obj, fn) {
			for(var name in obj) {
				fn(obj[name], name);
			}
		},

		contains: function(array, k) {
			for(var item in array) {
				if (k === array[item]) return true;
			}
			return false;
		},

		reduce: function(array, fn) {
			var ret = array[0];
			for (var i = 1; i < array.length; i ++)	{
				ret = fn(ret, array[1]);
			}
			return ret;
		},

		some: function(a) {
			if (!u.isArray(a)) return false;
			return a.length > 0;
		},

		isArray: function(a) {
			return Object.prototype.toString.call(a) === "[object Array]";
		},

		isDate: function(d) {
			return Object.prototype.toString.call(d) === "[object Date]";
		},

		isString: function(s) {
			return typeof s === 'string';
		},

		isNumber: function(s) {
			return typeof s === 'number';
		},

		isFunction: function(f) {
			return typeof f === 'function';
		},

		every: function(list, fn) {
			for(var item in list) {
				if (!fn(list[item])) return false;
			}
			return true;
		},
		has: function(obj, propName) {
			return obj.hasOwnProperty(propName);
		}
	};

	// internal functions
	var internal = {
		getValidateFunc: function (validate, errString) {
			return function(value, name) {
				if (!validate(value)) return errString(name);
				return undefined;
			};
		},
		sprintf: function(str)
		{
			if (typeof str !== 'string') throw 'the 1st argument should be string';
			var parts = str.split('%s');
			if (parts.length != arguments.length) throw 'the number of %s in string is not equal to the number of variables';
			var ret = parts[0];
			for (var i = 1; i < arguments.length; i ++) {
				ret += arguments[i] + parts[i];
			}
			return ret;
		},
		existy:function(obj, prop) {
			return obj[prop] !== undefined;
		}
	};

	function validateObject(obj, options, namespace) {
		var errs = [];

		namespace = namespace || '';
		u.each(options, function (validators, propName) {

			var fullName = namespace + propName;

			if (u.isObject(obj[propName]) && !u.isArray(options[propName])) {
				if (!u.isObject(obj[propName])) throw internal.sprintf('%s in validator is an object, while %s in object is not', propName, propName);
				validateObject(obj[propName], options[propName], fullName + '.');
				return;
			}

			if (u.isArray(obj[propName])) {
				u.each(obj[propName], function(member){
					viaValidators(validators, member);
				});
				return;
			}
			viaValidators(validators, obj[propName]);

			function viaValidators(validators, propValue) {
				if (!u.isArray(validators)) validators = [validators];
				u.each(validators, function (validate) {
					if (typeof propValue === 'undefined' &&  validate.name !== 'required' ) return;
					var err = validate(propValue, fullName, obj);
					if (err) errs.push(err);
				});
			}
		});

		return u.some(errs) ? errs : null;
	}


	return {
		validateObj: validateObject,

		required: function required(value, name, obj) {
			if (!internal.existy(obj, name)) return name + ' is required';
			return undefined;
		},

		isDate: function (value, name) {
			return internal.getValidateFunc(u.isDate, function(name) {return internal.sprintf('%s is not date', name);})(value, name);
		},

		isString: function (value, name) {
			return internal.getValidateFunc(u.isString, function(name) {return internal.sprintf('%s is not string', name);})(value, name);
		},

		isNumber: function (value, name) {
			return internal.getValidateFunc(u.isNumber, function(name) {return internal.sprintf('%s is not number', name);})(value, name);
		},

		isIn: function (opts) {
			return function(value, name) {
				return internal.getValidateFunc(
					function (prop) {
						return u.contains(opts, prop);
					},
					function (name) {
						return internal.sprintf('%s must be one of (%s)', name,
							u.reduce(opts, function(whole, opt) {return internal.sprintf('%s, %s', whole, opt);}));
					}
				)(value,name);
			}
		},

		minLength: function (min) {
			return internal.getValidateFunc(
				function(prop) {return u.isString(prop) && prop.length >= min;},
				function(name) {return internal.sprintf('%s must have at least %d characters', name, min); }
			);
		},

		isValidator: {
			validator: function(v) {
				if (u.isFunction(v)) return true;
				if (u.isArray(v) && u.every(v, u.isFunction)) return true;
				if (_isvalidatorObj(v)) return true;
				if (u.isArray(v) && u.every(v, _isvalidatorObj)) return true;
				return false;

				function _isvalidatorObj(v) {
					if (!u.isObject(v)) return false;
					return u.has(v, 'validator') && u.isFunction(v['validator']) &&
						u.has(v, 'err') && (u.isFunction(v['err']) || u.isString(v['err']));
				}
			},
			err: function(propName) {
				return internal.sprintf('%s is not a validator, validator should be a {validatorFunc, err}, validatorFunc, [validatorFunc], or [{validatorFunc, err}]');
			}
		}
	}


});