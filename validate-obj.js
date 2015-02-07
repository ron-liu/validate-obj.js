//     validate-obj.js
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
	var funcAttrName = '__validator-obj__';
	var selfCrossValidatorPropName = 'selfCrossValidators';
	var u = { // small set of underscore
		each: function(collection, fn) {
			if (u.isArray(collection)) {
				for(var i = 0; i < collection.length; i ++) {
					fn(collection[i], i);
				}
				return;
			}

			for(var name in collection) {
				fn(collection[name], name);
			}
		},
		map: function(collection, fn) {
			var ret = [];

			u.each(collection, function(value, key) {
				ret.push(fn(value, key));
			});

			return ret;
		},
		isObject : function(o) {
			return typeof o === "object";
		},
		contains: function(collection, k) {
			var found = false;
			u.each(collection, function(item) {
				if (k === item) found = true;
			});
			return found;
		},
		every: function(collection, fn) {
			var result = true;
			u.each(collection, function(item) {
				if (!fn(item)) result = false;
			});
			return result;
		},
		filter: function(collection, fn) {
			var ret = [];
			u.each(collection, function(item) {
				if (fn(item)) ret.push(item);
			})
			return ret;
		},
		find: function(collection, fn) {
			var ret = undefined;
			u.each(collection, function(item) {
				if (fn(item)) ret = item;
			});
			return ret;
		},
		reduce: function(list, fn, memo) {
			var ret = memo || list[0],
				hasMemo = !!memo;
			for (var i = hasMemo ? 0 : 1; i < list.length; i ++)	{
				ret = fn(ret, list[i]);
			}
			return ret;
		},
		some: function(list) {
			if (!u.isArray(list)) return false;
			return list.length > 0;
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
		isBoolean: function(b) {
			return typeof b === 'boolean';
		},
		isNumber: function(s) {
			return typeof s === 'number';
		},
		isFunction: function(f) {
			return typeof f === 'function';
		},
		has: function(obj, propName) {
			return obj.hasOwnProperty(propName);
		},
		union: function(/*list of lists*/) {
			var ret = [];
			u.each(arguments, function(argument, name) {
				if (!m.existy(argument)) return;
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
		},
		identity: function(i) {return i;},
		first: function(list) {return list[0];}
	};
	var m = { // internal functions
		emptyToNull: function(list) {
			var ret = u.filter(list, u.identity);
			return u.some(ret) ? ret : null;
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
		isConcrete: function(func) {
			return u.has(func, funcAttrName) && func[funcAttrName].type === 'concrete';
		},
		isHighOrder: function(func) {
			return u.has(func, funcAttrName) && func[funcAttrName].type === 'highOrder';
		},
		funcName : function(func) {
			return u.has(func, funcAttrName) && func[funcAttrName].name;
		},
		isValidationExpression: function(v) {
			var validators = u.isArray(v) ? v : [v];
			return u.every(validators, _isValidator);

			function _isValidator(v) {
				if(!u.isFunction(v)) return false;
				return (m.isConcrete(v) || (m.isHighOrder(v)));
			}
		}
	};

	var ret = {
		hasErrors: function (target, validationExpression /*, name, errs*/) {
			var name = arguments[2] || 'it'; // used to recursive call and calculate the full name
			var errs = arguments[3] || []; // used to recursive call and collect the errors
			var selfCrossValidators;

			function _validate(expression, value, name) {
				if (!u.isArray(expression)) expression = [expression];
				return u.filter(
					u.map(expression, function (validator) {
						if (m.isHighOrder(validator)) validator = validator();
						if (!m.existy(value) && m.funcName(validator) !== 'required') return null;
						return validator(value, name);
					}), u.identity);
			}

			if (m.isValidationExpression(validationExpression))	{
				return m.emptyToNull(u.union(errs, _validate(validationExpression, target, name)));
			}

			if (u.isArray(validationExpression)) {
				if (validationExpression.length !== 1) throw 'array validation expression must have one and only one validation expression, like [[v.required, v.isString]]';
				if(!u.isArray(target)) return [m.sprintf('%s is not array', name)];
				if(!m.isValidationExpression(validationExpression[0])) {
					u.each(target, function(o, no) {
						errs = u.union(errs, ret.hasErrors((m.existy(o) ? o : {}), validationExpression[0], m.sprintf('%s[%s]', name, no)));
					})
					return m.emptyToNull(errs);
				}
				return m.emptyToNull(u.union(errs, u.reduce(u.map(target, function(item, i){
					return _validate(validationExpression[0], item, m.sprintf('%s[%s]', name, i));
				}), function(a,b){return u.union(a, b)})));
			}

			if (!u.isObject(validationExpression)) throw m.sprintf("invalid validation expression: %s", name);
			if (m.existy(validationExpression[selfCrossValidatorPropName])) {
				u.each(u.isArray(validationExpression[selfCrossValidatorPropName]) ? validationExpression[selfCrossValidatorPropName] : [validationExpression[selfCrossValidatorPropName]], function(cross) {
					var result = cross(target);
					if (m.existy(result)) errs.push(result);
				});
			}
			u.each(validationExpression, function (validators, propName) {
				if (propName === selfCrossValidatorPropName) return;
				errs = u.union(errs, ret.hasErrors((m.existy(target) ? target : {})[propName], validators, name + '.' + propName))
			});

			return m.emptyToNull(errs);
		},

		isValidationExpression: m.isValidationExpression,

		register : function(name, func) {
			if (!u.isFunction(func)) throw 'the passing argument is not a function';
			name = name || func.name;
			if (!name) throw  'the passing argument has no name';
			var highOrderFunc = function() { // err, params both optional, but err must be a function or string, params must be array
				var err = u.find(arguments, function(item) {return u.isString(item) || u.isFunction(item)});
				var params = u.find(arguments, u.isArray);
				var ret = function(value, name) {
					return func(value, name, err, params);
				};
				ret[funcAttrName] = {type:'concrete',  name: name};
				return ret;
			};
			highOrderFunc[funcAttrName] = {type:'highOrder'};
			ret[name] = highOrderFunc;
		},

		build: function(validateFn, errFn) {
			errFn = errFn || function(name) {return name + ' is invalid';};
			if (!u.isFunction(validateFn) || !u.isFunction(errFn)) throw 'validateFn and errFn are required';
			return function(value, name, err, params) {
				err = err || errFn;
				try {
					return validateFn(value, params) ? null : (u.isString(err) ? err : err(name, params, value));
				}
				catch(e) {
					throw m.sprintf('%s: %s', name, e);
				}
			};
		}
	};

	ret.register('required', ret.build(
		function(value) {return m.existy(value) && (value !== '');},
		function(name) {return  name + ' is required';}
	));
	ret.register('isDate', ret.build(
		u.isDate,
		function(name) {return m.sprintf('%s is not date', name);}
	));
	ret.register('isBool', ret.build(
		u.isBoolean,
		function(name) {return m.sprintf('%s is not bool', name);}
	));
	ret.register('isString', ret.build(
		u.isString,
		function(name) {return m.sprintf('%s is not string', name);}
	));
	ret.register('isNumber', ret.build(
		u.isNumber,
		function(name) {return m.sprintf('%s is not number', name);}
	));
	ret.register('isIn',ret.build(
		function (value, params) {
			if(!u.isArray(params)) throw m.sprintf('isIn has to have a array options parameter like v.isIn([\'option1\', \'option2\'])');
			return u.contains(params, value);
		},
		function (name, params) {
			return m.sprintf('%s must be one of (%s)', name,
				u.reduce(params, function(whole, opt) {return m.sprintf('%s, %s', whole, opt);}));
		}
	));
	ret.register('minLength', ret.build(
		function(value, params) {
			if(!u.isArray(params) || params.length !== 1 || !u.isNumber(u.first(params))) throw m.sprintf('minLengTh MUST have one number in the params array');
			return u.isString(value) && value.length >= u.first(params);
		},
		function(name, params) {return m.sprintf('%s must be a string and have at least %s characters', name, params[0]); }
	));
	ret.register('maxLength', ret.build(
		function(value, params) {
			if(!u.isArray(params) || params.length !== 1 || !u.isNumber(u.first(params))) throw m.sprintf('maxLengTh MUST have one number in the params array');
			return u.isString(value) && value.length <= u.first(params);
		},
		function(name, params) {return m.sprintf('%s must be a string and have at most %s characters', name, params[0]); }
	));
	ret.register('isEmail', ret.build(
		function(value) {
			// This magic string is coming from http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(value);
		},
		function(name) {return m.sprintf('%s is not email', name);}
	));
	ret.register('isCreditCard', ret.build(
		function(value){
			// This magic string is coming from http://www.informit.com/articles/article.aspx?p=1223879&seqNum=12
			var re = /^(5[1-5]\d{14})|(4\d{12}(\d{3})?)|(3[47]\d{13})|(6011\d{14})|((30[0-5]|36\d|38\d)\d{11})$/;
			return re.test(value);
		},
		function(name) {return m.sprintf('%s is not credit card number', name);}
	));
	ret.register('isUrl', ret.build(
		function(value) {
			var re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			return re.test(value);
		},
		function(name){return m.sprintf('%s is not url', name);}
	));
	ret.register('isBefore', ret.build(
		function(value, params) {
			if(!u.isArray(params) || params.length !==1 || !u.isDate(u.first(params))) throw m.sprintf('isBefore must have one date in the params array');
			return value < u.first(params);
		},
		function(name) {return m.sprintf('%s is not before', name);}
	));
	ret.register('isAfter', ret.build(
		function(value, params) {
			if(!u.isArray(params) || params.length !==1 || !u.isDate(u.first(params))) throw m.sprintf('isAfter must have one date in the params array');
			return value > u.first(params);
		},
		function(name) {return m.sprintf('%s is not after', name);}
	));
	ret.register('isObject', ret.build(
		function(value, params) {
			return u.isObject(value)
		},
		function(name) {return m.sprintf('%s is not object', name);}
	))
	return ret;
});
