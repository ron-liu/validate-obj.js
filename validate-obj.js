//     validate-obj.js 1.5.2
//     (c) 2014 Ron Liu
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

		reduce: function(array, fn, memo) {
			var ret = memo || array[0],
				hasMemo = !!memo;

			for (var i = hasMemo ? 0 : 1; i < array.length; i ++)	{
				ret = fn(ret, array[i]);
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
		},
		union: function() {
			var ret = [];
			u.each(arguments, function(argument, name) {
				u.each(argument, function(item, itemName) {
					if (u.contains(ret, item)) return;
					ret.push(item);
				});
			});
			return ret;
		},
		range: function(n) {
			var ret = [];
			for(var i = 0; i < n; i ++) ret.push(i);
			return ret;
		}
	}; // small set of underscore
	var funcAttrName = '__validator-obj__';

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
		existy:function(value) {
			return value !== undefined && value !== null;
		},

		isValidationExpression: function(v) {
			var validators = u.isArray(v) ? v : [v];
			return u.every(validators, _isValidator);

			function _isValidator(v) {
				if(!u.isFunction(v)) return false;
				if (!u.has(v, funcAttrName)) return false;
				var attr = v[funcAttrName];
				return (attr.type === 'concrete' ||
					(attr.type === 'highOrder' && !attr.needParams));
			}
		}
	}; // internal functions

	var ret = {
		validateObj: function (obj, validatorObj, name, errs) {
			var errs = errs || [];
			name = name || '';

			function _validate(validators, value, name) {
				var ret = [];
				if (!u.isArray(validators)) validators = [validators];
				u.map(validators, function(validator) {
					return validator(value, name);
				});
				u.each(validators, function (validator) {
					var err = validator(value, name);
					if (err) ret.push(err);
				});
				return ret;
			}

			if (internal.isValidationExpression(validatorObj)) return u.union(errs, _validate(validatorObj, obj, name));

			u.each(validatorObj, function (validators, propName) {

				var fullName = name + propName;

				if (u.isObject(obj[propName]) && !u.isArray(validatorObj[propName])) {
					if (!u.isObject(obj[propName])) throw internal.sprintf('%s in validator is an object, while %s in object is not', propName, propName);
					validateObject(obj[propName], validatorObj[propName], fullName + '.');
					return;
				}

				if (u.isArray(obj[propName])) {
					u.each(obj[propName], function(member){
						_validate(validators, member);
					});
					return;
				}
				_validate(validators, obj[propName]);
			});

			return u.some(errs) ? errs : null;
		},

		required: {
			validator: function required(value) {
				return internal.existy(value) ;
			},
			err: function(name) {
				return name + ' is required';
			}
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

		// validator could have the following format:
		// v.func;
		// {validator: v.func, err: 'this is wrong'};
		// {validator: v.func, err: function(propName) {...}}
		// {validator: v.func, {...}
		// and array of the above
		isValidationExpression: internal.isValidationExpression,

		register : function() /* name, func, needParams or func, needParams */ {
			var name, func, needParams;
			if (!u.contains([2,3], arguments.length)) throw 'only suppoert 2 or 3 parameters';
			if (arguments.length === 2) {
				func = arguments[0];
				needParams = arguments[1];
			}
			if (arguments.length === 3) {
				name = arguments[0];
				func = arguments[1];
				needParams = arguments[2];
			}
			if (!u.isFunction(func)) throw 'the passing argument is not a function';
			name = name || func.name;
			if (!name) throw  'the passing argument has no name';
			var highOrderFunc = function(err, params) {
				var ret = function(value, name) {
					return func(value, name, err, params);
				};
				ret[funcAttrName] = {type:'concrete', needParams: needParams};
				return ret;
			};
			highOrderFunc[funcAttrName] = {type:'highOrder', needParams: needParams};
			ret[name] = highOrderFunc;
		}
	};



	return ret;
});